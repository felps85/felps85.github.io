import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = "https://felip.eu";
const OUTPUT_DIR = path.resolve("data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "portfolio.json");

const NAMED_HTML_ENTITIES = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  "#39": "'"
};

function fetchPage(url) {
  return execFileSync("curl", ["-L", "--retry", "3", "--retry-delay", "1", "--max-time", "30", url], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024
  });
}

function decodeHtml(value = "", { decodeBrackets = true } = {}) {
  return value.replace(/&(#\d+|#x[0-9a-f]+|nbsp|amp|quot|#39|lt|gt);/gi, (match, token) => {
    const normalized = token.toLowerCase();

    if (normalized === "lt") {
      return decodeBrackets ? "<" : "&lt;";
    }

    if (normalized === "gt") {
      return decodeBrackets ? ">" : "&gt;";
    }

    if (normalized.startsWith("#x")) {
      const point = Number.parseInt(normalized.slice(2), 16);
      return Number.isNaN(point) ? match : String.fromCodePoint(point);
    }

    if (normalized.startsWith("#")) {
      const point = Number.parseInt(normalized.slice(1), 10);
      return Number.isNaN(point) ? match : String.fromCodePoint(point);
    }

    return NAMED_HTML_ENTITIES[normalized] ?? match;
  });
}

function stripUnsafeHtml(value = "") {
  let current = value;
  let previous = "";

  while (current !== previous) {
    previous = current;
    current = current.replace(/<[^>]+>/g, "");
  }

  return current;
}

function stripTags(value = "") {
  const withoutTags = stripUnsafeHtml(
    value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
  );

  return decodeHtml(withoutTags, { decodeBrackets: false })
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function getMatch(html, pattern, fallback = "") {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1].trim()) : fallback;
}

function extractBalancedBlock(html, startIndex) {
  let depth = 0;
  let cursor = startIndex;

  while (cursor < html.length) {
    const nextOpen = html.indexOf("<div", cursor);
    const nextClose = html.indexOf("</div>", cursor);

    if (nextOpen === -1 && nextClose === -1) {
      break;
    }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 4;
      continue;
    }

    depth -= 1;
    cursor = nextClose + 6;
    if (depth === 0) {
      return html.slice(startIndex, cursor);
    }
  }

  return "";
}

function extractProjectModules(html) {
  const containerStart = html.indexOf('<div id="project-modules">');
  const containerEnd = html.indexOf("</div>\n        </div>", containerStart);
  const area = containerStart === -1 ? html : html.slice(containerStart, containerEnd === -1 ? undefined : containerEnd);
  const modules = [];
  let cursor = 0;

  while (true) {
    const start = area.indexOf('<div class="project-module module ', cursor);
    if (start === -1) {
      break;
    }

    const block = extractBalancedBlock(area, start);
    if (!block) {
      break;
    }

    cursor = start + block.length;

    if (block.includes("project-module-text")) {
      const richText = getMatch(block, /<div class="rich-text js-text-editable module-text">([\s\S]*?)<\/div>\s*<\/div>/);
      const text = stripTags(richText);
      if (text) {
        modules.push({ type: "text", text });
      }
      continue;
    }

    if (block.includes("project-module-image")) {
      const image = getMatch(block, /data-src="([^"]+)"/);
      const caption = stripTags(getMatch(block, /<div class="rich-text module-caption js-text-editable">([\s\S]*?)<\/div>/));
      if (image) {
        modules.push({ type: "image", src: image, caption });
      }
      continue;
    }

    if (block.includes("project-module-embed")) {
      const iframe = getMatch(block, /<iframe[^>]+src="([^"]+)"/);
      if (iframe) {
        modules.push({ type: "embed", src: iframe });
      }
    }
  }

  return modules;
}

function extractSocials(html) {
  const socials = [];
  const matches = html.matchAll(/<a href="(https?:\/\/[^\"]+|mailto:[^\"]+)"[^>]*target="_blank"|<a href="(mailto:[^\"]+)"/g);
  for (const match of matches) {
    const href = match[1] || match[2];
    if (!href || socials.includes(href)) {
      continue;
    }
    socials.push(href);
  }
  return socials;
}

function extractWorkIndex(html) {
  const projects = [];
  const matches = html.matchAll(
    /<a class="project-cover[\s\S]*?href="\/([^"]+)"[\s\S]*?<img[\s\S]*?data-src="([^"]+)"[\s\S]*?<div class="title preserve-whitespace">([\s\S]*?)<\/div>[\s\S]*?<div class="date">([\s\S]*?)<\/div>/g
  );

  for (const match of matches) {
    projects.push({
      slug: decodeHtml(match[1].trim()),
      cover: decodeHtml(match[2].trim()),
      title: stripTags(match[3]),
      year: stripTags(match[4])
    });
  }

  return projects;
}

function buildSummary(modules) {
  return modules
    .filter((module) => module.type === "text")
    .map((module) => module.text)
    .join("\n\n")
    .trim();
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const homeHtml = fetchPage(`${SITE_URL}/`);
const contactHtml = fetchPage(`${SITE_URL}/contact`);
const workHtml = fetchPage(`${SITE_URL}/work`);

const home = {
  siteTitle: getMatch(homeHtml, /<title>([^<]+)<\/title>/, "Felipe Soares"),
  metaDescription: getMatch(homeHtml, /<meta name="description"\s+content="([^"]+)"/, "Product designer living in Dublin"),
  heading: getMatch(homeHtml, /<h1[^>]*>([\s\S]*?)<\/h1>/, "Hi there!"),
  intro: stripTags(getMatch(homeHtml, /<div data-context="page\.masthead" data-hover-hint="mastheadText"><p[^>]*>([\s\S]*?)<\/p>/)),
  socials: extractSocials(homeHtml)
};

const contact = {
  title: getMatch(contactHtml, /<h1 class="title[^"]*">([\s\S]*?)<\/h1>/, "Contact"),
  email: extractSocials(contactHtml).find((href) => href.startsWith("mailto:")) || "",
  formFields: ["Name", "Email Address", "Message"]
};

const workIndex = extractWorkIndex(workHtml);
const projects = [];

for (const project of workIndex) {
  const html = fetchPage(`${SITE_URL}/${project.slug}`);
  const modules = extractProjectModules(html);
  projects.push({
    ...project,
    url: `${SITE_URL}/${project.slug}`,
    title: getMatch(html, /<h1 class="title preserve-whitespace e2e-site-logo-text">([\s\S]*?)<\/h1>/, project.title),
    modules,
    summary: buildSummary(modules)
  });
}

const output = {
  exportedAt: new Date().toISOString(),
  source: SITE_URL,
  home,
  contact,
  projects
};

writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Scraped ${projects.length} projects into ${OUTPUT_FILE}`);
