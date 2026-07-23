import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const INVENTORY_RELATIVE_PATH = "src/content/loto-foot/inventory.json";
const INVENTORY_DIRECTORIES = {
  publications: "src/content/loto-foot/publications",
  results: "src/content/loto-foot/results",
};

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

async function listJsonFiles(rootDirectory, relativeDirectory) {
  const absoluteDirectory = path.resolve(rootDirectory, ...relativeDirectory.split("/"));
  let entries;

  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    throw new Error(
      `Impossible de lire le dossier attendu « ${relativeDirectory} » : ${errorMessage(error)}`,
      { cause: error },
    );
  }

  return [
    ...new Set(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => path.posix.join(relativeDirectory, entry.name)),
    ),
  ].sort();
}

export async function createLotoFootInventory(rootDirectory) {
  const [publications, results] = await Promise.all([
    listJsonFiles(rootDirectory, INVENTORY_DIRECTORIES.publications),
    listJsonFiles(rootDirectory, INVENTORY_DIRECTORIES.results),
  ]);

  return {
    version: 1,
    publications,
    results,
  };
}

export function serializeLotoFootInventory(inventory) {
  return `${JSON.stringify(inventory, null, 2)}\n`;
}

export async function syncLotoFootInventory({ rootDirectory = process.cwd(), check = false } = {}) {
  const inventory = await createLotoFootInventory(rootDirectory);
  const expectedContent = serializeLotoFootInventory(inventory);
  const inventoryPath = path.resolve(rootDirectory, ...INVENTORY_RELATIVE_PATH.split("/"));
  let currentContent;

  try {
    currentContent = await readFile(inventoryPath, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw new Error(
        `Impossible de lire l’inventaire « ${INVENTORY_RELATIVE_PATH} » : ${errorMessage(error)}`,
        { cause: error },
      );
    }
  }

  if (currentContent === expectedContent) {
    return { updated: false, content: expectedContent };
  }

  if (check) {
    throw new Error(
      `L’inventaire « ${INVENTORY_RELATIVE_PATH} » ne correspond pas aux fichiers JSON présents.`,
    );
  }

  await writeFile(inventoryPath, expectedContent, "utf8");
  return { updated: true, content: expectedContent };
}

async function run() {
  const argumentsList = process.argv.slice(2);
  const unknownArguments = argumentsList.filter((argument) => argument !== "--check");

  if (
    unknownArguments.length > 0 ||
    argumentsList.filter((argument) => argument === "--check").length > 1
  ) {
    throw new Error(`Argument inconnu. Usage : node ${process.argv[1]} [--check]`);
  }

  const { updated } = await syncLotoFootInventory({ check: argumentsList.includes("--check") });
  console.log(
    updated
      ? `Inventaire Loto Foot mis à jour : ${INVENTORY_RELATIVE_PATH}`
      : `Inventaire Loto Foot déjà à jour : ${INVENTORY_RELATIVE_PATH}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(errorMessage(error));
    process.exitCode = 1;
  });
}
