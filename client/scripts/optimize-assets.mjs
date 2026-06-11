import { mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, prune, quantize, textureCompress, weld } from "@gltf-transform/functions";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const publicRoot = path.join(projectRoot, "public");
const sourceAssetRoot = path.join(projectRoot, "source-assets", "unused-public-models");
const sofaProductUrl = pathToFileURL(path.join(projectRoot, "src/data/sofaProduct.js"));
const tableProductUrl = pathToFileURL(path.join(projectRoot, "src/data/tableProduct.js"));
const { sofaProduct } = await import(sofaProductUrl);
const { tableProduct } = await import(tableProductUrl);

const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const fabricMaterialNames = sofaProduct.fabricMaterialNames ?? [];
const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function collectFiles(directory, extension) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath, extension)));
    } else if (entry.name.endsWith(extension)) {
      files.push(entryPath);
    }
  }

  return files;
}

function collectReferencedModelUrls() {
  const urls = new Set();

  tableProduct.tops?.forEach((top) => urls.add(top.modelUrl));
  tableProduct.legs?.forEach((legs) => urls.add(legs.modelUrl));
  sofaProduct.modules?.forEach((module) => {
    Object.values(module.variantModels ?? {}).forEach((variantModel) => {
      urls.add(variantModel.modelUrl);
    });
  });

  return new Set([...urls].filter(Boolean).map((url) => url.replace(/^\//, "")));
}

function stripDynamicFabricTextures(document) {
  for (const material of document.getRoot().listMaterials()) {
    const name = material.getName() ?? "";
    const isDynamicFabric = fabricMaterialNames.some((fabricName) =>
      name.includes(fabricName)
    );

    if (isDynamicFabric) {
      material.setBaseColorTexture(null);
      material.setBaseColorFactor([1, 1, 1, 1]);
      material.setRoughnessFactor(0.86);
      material.setMetallicFactor(0.02);
    }
  }
}

async function optimizeGlb(filePath) {
  const before = (await stat(filePath)).size;
  const document = await io.read(filePath);

  if (filePath.includes(`${path.sep}models${path.sep}sofa${path.sep}`)) {
    stripDynamicFabricTextures(document);
  }

  await document.transform(
    dedup(),
    prune({ keepAttributes: true }),
    weld({ tolerance: 0.00001 }),
    quantize({
      quantizePosition: 14,
      quantizeNormal: 10,
      quantizeTexcoord: 12,
      quantizationVolume: "mesh",
    }),
    textureCompress({
      encoder: sharp,
      targetFormat: "jpeg",
      resize: [1024, 1024],
      quality: 72,
      slots: /baseColorTexture/,
    }),
    prune({ keepAttributes: true })
  );

  await io.write(filePath, document);
  const after = (await stat(filePath)).size;

  return { before, after };
}

async function moveUnusedPublicModel(filePath) {
  const relativePath = path.relative(publicRoot, filePath);
  const targetPath = path.join(sourceAssetRoot, relativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await rename(filePath, targetPath);

  return targetPath;
}

const referencedModelUrls = collectReferencedModelUrls();
const glbFiles = await collectFiles(path.join(publicRoot, "models"), ".glb");
let optimizedBefore = 0;
let optimizedAfter = 0;
let movedBytes = 0;
let optimizedCount = 0;
let movedCount = 0;

for (const filePath of glbFiles) {
  const publicPath = path.relative(publicRoot, filePath).split(path.sep).join("/");

  if (!referencedModelUrls.has(publicPath)) {
    movedBytes += (await stat(filePath)).size;
    await moveUnusedPublicModel(filePath);
    movedCount += 1;
    continue;
  }

  const { before, after } = await optimizeGlb(filePath);
  optimizedBefore += before;
  optimizedAfter += after;
  optimizedCount += 1;
  console.log(`${publicPath}: ${formatBytes(before)} -> ${formatBytes(after)}`);
}

console.log("");
console.log(`Optimized referenced GLBs: ${optimizedCount}`);
console.log(`Referenced GLB size: ${formatBytes(optimizedBefore)} -> ${formatBytes(optimizedAfter)}`);
console.log(`Moved unused public GLBs: ${movedCount} (${formatBytes(movedBytes)})`);
console.log(`Unused sources moved to: ${path.relative(projectRoot, sourceAssetRoot)}`);
