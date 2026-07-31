import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const nativeFetch = globalThis.fetch.bind(globalThis);
const FDJ_HOST = "www.pointdevente.parionssport.fdj.fr";

function requestUrl(input) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function isFdjLotoFootUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.hostname === FDJ_HOST &&
      url.pathname.includes("/grilles/loto-foot/")
    );
  } catch {
    return false;
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class CdpConnection {
  constructor(webSocketUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(webSocketUrl);
  }

  async open() {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Connexion au navigateur expirée.")),
        10_000,
      );
      this.socket.addEventListener(
        "open",
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
      this.socket.addEventListener(
        "error",
        () => {
          clearTimeout(timeout);
          reject(new Error("Connexion au navigateur impossible."));
        },
        { once: true },
      );
    });

    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
        return;
      }

      const listeners = this.listeners.get(message.method) ?? [];
      this.listeners.delete(message.method);
      for (const listener of listeners) listener(message.params);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMilliseconds) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const listeners = this.listeners.get(method) ?? [];
        this.listeners.set(
          method,
          listeners.filter((listener) => listener !== onEvent),
        );
        reject(new Error(`Évènement Chrome absent : ${method}`));
      }, timeoutMilliseconds);

      const onEvent = (params) => {
        clearTimeout(timeout);
        resolve(params);
      };
      const listeners = this.listeners.get(method) ?? [];
      listeners.push(onEvent);
      this.listeners.set(method, listeners);
    });
  }

  close() {
    this.socket.close();
  }
}

async function waitForDevToolsPort(userDataDirectory, chromeProcess, stderr) {
  const portFile = path.join(userDataDirectory, "DevToolsActivePort");
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (chromeProcess.exitCode !== null) {
      throw new Error(`Chrome s’est arrêté avant le démarrage. ${stderr.value}`);
    }
    try {
      const [port] = (await readFile(portFile, "utf8")).trim().split(/\r?\n/u);
      if (port) return Number.parseInt(port, 10);
    } catch {
      // Chrome écrit le fichier après son initialisation.
    }
    await wait(100);
  }
  throw new Error("Chrome n’a pas exposé son port de débogage.");
}

async function evaluate(connection, expression) {
  const evaluation = await connection.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (evaluation.exceptionDetails) {
    throw new Error(evaluation.exceptionDetails.text ?? "Évaluation Chrome impossible.");
  }
  return evaluation.result.value;
}

async function renderFdjPage(url) {
  const executablePath = process.env.CHROME_PATH;
  if (!executablePath) {
    throw new Error("CHROME_PATH est absent : Chrome ne peut pas être lancé.");
  }

  const userDataDirectory = await mkdtemp(path.join(tmpdir(), "preuve90-chrome-"));
  const stderr = { value: "" };
  const chromeProcess = spawn(
    executablePath,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDirectory}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  chromeProcess.stderr.on("data", (chunk) => {
    stderr.value = `${stderr.value}${chunk}`.slice(-8_000);
  });

  let connection;
  try {
    const port = await waitForDevToolsPort(userDataDirectory, chromeProcess, stderr);
    const targetResponse = await nativeFetch(
      `http://127.0.0.1:${port}/json/new?about:blank`,
      { method: "PUT" },
    );
    if (!targetResponse.ok) {
      throw new Error(`Création de l’onglet Chrome impossible (${targetResponse.status}).`);
    }
    const target = await targetResponse.json();
    connection = new CdpConnection(target.webSocketDebuggerUrl);
    await connection.open();
    await connection.send("Page.enable");
    await connection.send("Runtime.enable");

    const loadEvent = connection.waitForEvent("Page.loadEventFired", 60_000);
    await connection.send("Page.navigate", { url });
    await loadEvent;
    await wait(5_000);

    const normalizedInputs = await evaluate(
      connection,
      `(() => {
        const values = { one: "1", n: "N", two: "2" };
        const inputs = Array.from(document.querySelectorAll('input[formcontrolname]'));
        for (const input of inputs) {
          const selection = values[input.getAttribute('formcontrolname')];
          if (selection) input.setAttribute('value', selection);
          if (input.checked) input.setAttribute('checked', '');
          else input.removeAttribute('checked');
        }
        return {
          total: inputs.length,
          checked: inputs.filter((input) => input.checked).length,
        };
      })()`,
    );

    const html = await evaluate(connection, "document.documentElement.outerHTML");
    console.log(
      `FDJ_RENDERED url=${url} html_bytes=${Buffer.byteLength(html)} inputs=${normalizedInputs.total} checked=${normalizedInputs.checked}`,
    );

    return html;
  } finally {
    connection?.close();
    chromeProcess.kill("SIGTERM");
    await wait(500);
    if (chromeProcess.exitCode === null) chromeProcess.kill("SIGKILL");
    await rm(userDataDirectory, { recursive: true, force: true });
  }
}

globalThis.fetch = async (input, init) => {
  const url = requestUrl(input);
  if (!isFdjLotoFootUrl(url)) return nativeFetch(input, init);

  const html = await renderFdjPage(url);
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
};
