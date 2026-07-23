import { afterEach, describe, expect, it } from "vitest";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createLotoFootInventory,
  serializeLotoFootInventory,
  syncLotoFootInventory,
} from "../../../scripts/generate-loto-foot-inventory.mjs";

const temporaryDirectories: string[] = [];

async function createRepositoryDirectories() {
  const rootDirectory = await mkdtemp(path.join(tmpdir(), "preuve90-loto-foot-inventory-"));
  temporaryDirectories.push(rootDirectory);

  await Promise.all([
    mkdir(path.join(rootDirectory, "src/content/loto-foot/publications"), { recursive: true }),
    mkdir(path.join(rootDirectory, "src/content/loto-foot/results"), { recursive: true }),
  ]);

  return rootDirectory;
}

async function createFile(rootDirectory: string, relativePath: string) {
  const absolutePath = path.join(rootDirectory, ...relativePath.split("/"));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, "{}\n", "utf8");
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe("générateur de l’inventaire Loto Foot", () => {
  it("détecte les JSON directs et ne garde en attente que les publications sans résultat", async () => {
    const rootDirectory = await createRepositoryDirectories();
    await Promise.all([
      createFile(rootDirectory, "src/content/loto-foot/publications/z-publication.json"),
      createFile(rootDirectory, "src/content/loto-foot/publications/a-publication.json"),
      createFile(rootDirectory, "src/content/loto-foot/publications/notes.txt"),
      createFile(rootDirectory, "src/content/loto-foot/publications/nested/ignored.json"),
      createFile(rootDirectory, "src/content/loto-foot/results/a-publication.json"),
      createFile(rootDirectory, "src/content/loto-foot/results/z-result.json"),
      createFile(rootDirectory, "src/content/loto-foot/results/result.JSON"),
    ]);

    const inventory = await createLotoFootInventory(rootDirectory);

    expect(inventory).toEqual({
      version: 2,
      publications: [
        "src/content/loto-foot/publications/a-publication.json",
        "src/content/loto-foot/publications/z-publication.json",
      ],
      results: [
        "src/content/loto-foot/results/a-publication.json",
        "src/content/loto-foot/results/z-result.json",
      ],
      pendingPublications: ["src/content/loto-foot/publications/z-publication.json"],
    });
    expect(
      [...inventory.publications, ...inventory.results, ...inventory.pendingPublications].every(
        (value) => !value.includes("\\"),
      ),
    ).toBe(true);
  });

  it("sérialise un contenu stable avec un saut de ligne final", () => {
    const inventory = {
      version: 2,
      publications: ["src/content/loto-foot/publications/a.json"],
      results: ["src/content/loto-foot/results/a.json"],
      pendingPublications: [],
    };

    const first = serializeLotoFootInventory(inventory);
    const second = serializeLotoFootInventory(inventory);

    expect(second).toBe(first);
    expect(first.endsWith("\n")).toBe(true);
  });

  it("ne réécrit pas un inventaire déjà identique", async () => {
    const rootDirectory = await createRepositoryDirectories();
    await createFile(rootDirectory, "src/content/loto-foot/publications/a.json");
    const firstRun = await syncLotoFootInventory({ rootDirectory });
    const inventoryPath = path.join(rootDirectory, "src/content/loto-foot/inventory.json");
    const firstContent = await readFile(inventoryPath, "utf8");
    const firstModificationTime = (await stat(inventoryPath)).mtimeMs;

    const secondRun = await syncLotoFootInventory({ rootDirectory });

    expect(firstRun.updated).toBe(true);
    expect(secondRun.updated).toBe(false);
    expect(await readFile(inventoryPath, "utf8")).toBe(firstContent);
    expect((await stat(inventoryPath)).mtimeMs).toBe(firstModificationTime);
  });

  it("échoue clairement lorsqu’un dossier attendu est absent", async () => {
    const rootDirectory = await createRepositoryDirectories();
    await rm(path.join(rootDirectory, "src/content/loto-foot/results"), { recursive: true });

    await expect(createLotoFootInventory(rootDirectory)).rejects.toThrow(
      /Impossible de lire le dossier attendu « src\/content\/loto-foot\/results »/,
    );
  });

  it("vérifie un inventaire obsolète sans le modifier", async () => {
    const rootDirectory = await createRepositoryDirectories();
    const inventoryPath = path.join(rootDirectory, "src/content/loto-foot/inventory.json");
    await writeFile(inventoryPath, '{"version":1}\n', "utf8");

    await expect(syncLotoFootInventory({ rootDirectory, check: true })).rejects.toThrow(
      /ne correspond pas aux fichiers JSON présents/,
    );
    expect(await readFile(inventoryPath, "utf8")).toBe('{"version":1}\n');
  });
});
