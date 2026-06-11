import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const imagesRoot = path.join(projectRoot, "public", "images");
const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectImages(entryPath)));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function getMaxDimension(filePath) {
  const normalizedPath = filePath.split(path.sep).join("/");

  if (normalizedPath.includes("/sofa/colours/")) return 2048;
  if (normalizedPath.includes("/table/material/")) return 640;
  return 640;
}

function isSofaFabricTexture(filePath) {
  return filePath.split(path.sep).join("/").includes("/sofa/colours/");
}

async function optimizeImage(filePath) {
  const before = (await stat(filePath)).size;
  const extension = path.extname(filePath).toLowerCase();
  const maxDimension = getMaxDimension(filePath);
  const tempPath = `${filePath}.tmp`;
  let pipeline = sharp(filePath).rotate().resize({
    width: maxDimension,
    height: maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  if (extension === ".png") {
    pipeline = pipeline.png({
      compressionLevel: 9,
      effort: 10,
      palette: !isSofaFabricTexture(filePath),
      quality: isSofaFabricTexture(filePath) ? 100 : 82,
    });
  } else {
    pipeline = pipeline.jpeg({
      quality: isSofaFabricTexture(filePath) ? 90 : 74,
      mozjpeg: true,
    });
  }

  await pipeline.toFile(tempPath);

  const optimizedSize = (await stat(tempPath)).size;

  if (optimizedSize < before) {
    await rename(tempPath, filePath);
    return { before, after: optimizedSize };
  }

  await import("node:fs/promises").then(({ rm }) => rm(tempPath));
  return { before, after: before };
}

const imageFiles = await collectImages(imagesRoot);
let totalBefore = 0;
let totalAfter = 0;

for (const filePath of imageFiles) {
  const { before, after } = await optimizeImage(filePath);
  totalBefore += before;
  totalAfter += after;
  console.log(
    `${path.relative(projectRoot, filePath)}: ${formatBytes(before)} -> ${formatBytes(after)}`
  );
}

console.log("");
console.log(`Image size: ${formatBytes(totalBefore)} -> ${formatBytes(totalAfter)}`);
