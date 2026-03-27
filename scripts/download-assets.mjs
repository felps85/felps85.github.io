import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const dataPath = path.resolve("data/portfolio.json");
const manifestPath = path.resolve("data/assets.json");
const assetsRoot = path.resolve("docs/assets");

const data = JSON.parse(readFileSync(dataPath, "utf8"));

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function extensionFromUrl(url, fallback = ".jpg") {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname);
  return ext || fallback;
}

function relativeAssetPath(...parts) {
  return ["assets", ...parts].join("/");
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(destination, bytes);
}

async function main() {
  rmSync(assetsRoot, { recursive: true, force: true });
  ensureDir(assetsRoot);

  const manifest = {
    generatedAt: new Date().toISOString(),
    covers: {},
    modules: {},
    embeds: {}
  };

  for (const project of data.projects) {
    const projectDir = path.join(assetsRoot, "projects", project.slug);
    ensureDir(projectDir);

    const coverExt = extensionFromUrl(project.cover, ".jpg");
    const coverName = `${project.slug}-cover${coverExt}`;
    const coverDest = path.join(projectDir, coverName);
    await downloadFile(project.cover, coverDest);
    manifest.covers[project.slug] = relativeAssetPath("projects", project.slug, coverName);

    let imageIndex = 1;
    let embedIndex = 1;

    for (const [moduleIndex, module] of project.modules.entries()) {
      if (module.type === "image") {
        const ext = extensionFromUrl(module.src, ".jpg");
        const filename = `${project.slug}-${String(imageIndex).padStart(2, "0")}${ext}`;
        const destination = path.join(projectDir, filename);
        await downloadFile(module.src, destination);
        manifest.modules[`${project.slug}:${moduleIndex + 1}`] = relativeAssetPath("projects", project.slug, filename);
        imageIndex += 1;
        continue;
      }

      if (module.type === "embed") {
        const videoId = module.src.includes("youtube.com/embed/") ? module.src.split("/embed/")[1]?.split("?")[0] : "";
        if (videoId) {
          const thumbName = `${project.slug}-video-${String(embedIndex).padStart(2, "0")}.jpg`;
          const thumbDest = path.join(projectDir, thumbName);
          const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          try {
            await downloadFile(thumbUrl, thumbDest);
            manifest.embeds[`${project.slug}:${moduleIndex + 1}`] = {
              poster: relativeAssetPath("projects", project.slug, thumbName),
              url: module.src
            };
          } catch {
            manifest.embeds[`${project.slug}:${moduleIndex + 1}`] = {
              poster: "",
              url: module.src
            };
          }
        }
        embedIndex += 1;
      }
    }
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Downloaded assets for ${data.projects.length} projects into ${assetsRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
