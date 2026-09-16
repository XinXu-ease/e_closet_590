import fs from "node:fs/promises";
import path from "node:path";

const fileKey = process.env.FIGMA_FILE_KEY || "7UmauOUmGRW7XMDdAkCosY";
const token = process.env.FIGMA_ACCESS_TOKEN;
const watch = process.argv.includes("--watch");
const outputPath = path.resolve("src/generated/figma-layout.local.json");
const screenNames = ["Closet", "Add New Item", "Item Detail", "Create Outfit", "Saved Outfits", "Outfit Detail", "Me / Settings"];

if (!token) {
  console.error("FIGMA_ACCESS_TOKEN is missing. Add it to .env.local before running figma:sync.");
  process.exit(1);
}

function walk(node, visit) {
  visit(node);
  for (const child of node.children || []) walk(child, visit);
}

function normalizeScreen(frame) {
  const text = [];
  const instances = [];
  walk(frame, (node) => {
    if (node.type === "TEXT" && node.characters) text.push({ name: node.name, text: node.characters });
    if (node.type === "INSTANCE") instances.push({ id: node.id, name: node.name, componentId: node.componentId });
  });
  return {
    id: frame.id,
    name: frame.name,
    size: frame.absoluteBoundingBox ? { width: frame.absoluteBoundingBox.width, height: frame.absoluteBoundingBox.height } : null,
    text,
    instances,
  };
}

let lastVersion = "";
async function sync() {
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, { headers: { "X-Figma-Token": token } });
  if (!response.ok) throw new Error(`Figma API ${response.status}: ${await response.text()}`);
  const file = await response.json();
  if (file.version === lastVersion) return;
  const frames = [];
  walk(file.document, (node) => { if (node.type === "FRAME" && screenNames.includes(node.name)) frames.push(node); });
  const missing = screenNames.filter((name) => !frames.some((frame) => frame.name === name));
  const generated = { fileKey, version: file.version, lastModified: file.lastModified, generatedAt: new Date().toISOString(), missing, screens: frames.map(normalizeScreen) };
  await fs.writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, "utf8");
  lastVersion = file.version;
  console.log(`Synced Figma version ${file.version}: ${frames.length}/7 screens.`);
  if (missing.length) console.warn(`Missing screens: ${missing.join(", ")}`);
}

await sync();
if (watch) setInterval(() => sync().catch((error) => console.error(error.message)), 15000);
