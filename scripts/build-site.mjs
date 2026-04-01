import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const data = JSON.parse(readFileSync(path.resolve("data/portfolio.json"), "utf8"));
const assetsManifestPath = path.resolve("data/assets.json");
const outputDir = path.resolve("docs");
const projectsDir = path.join(outputDir, "projects");
const analyticsDir = path.join(outputDir, "analytics");
const ANALYTICS_NAMESPACE = "felip-eu-portfolio";
const ANALYTICS_ACTIVE_BUCKET_SECONDS = 10;
let assets = { covers: {}, modules: {}, embeds: {} };

try {
  assets = JSON.parse(readFileSync(assetsManifestPath, "utf8"));
} catch {}

mkdirSync(outputDir, { recursive: true });
mkdirSync(projectsDir, { recursive: true });
mkdirSync(analyticsDir, { recursive: true });

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateText(value = "", maxLength = 220) {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength + 1);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated.slice(0, maxLength)).trim()}...`;
}

function socialLabel(href) {
  if (href.includes("behance")) return "Behance";
  if (href.includes("linkedin")) return "LinkedIn";
  if (href.includes("vimeo")) return "Vimeo";
  if (href.includes("github")) return "GitHub";
  if (href.startsWith("mailto:")) return "Email";
  return href;
}

function socialGlyph(href) {
  if (href.includes("behance")) return "Be";
  if (href.includes("linkedin")) return "in";
  if (href.includes("vimeo")) return "v";
  if (href.includes("github")) return "gh";
  if (href.startsWith("mailto:")) return "mail";
  return socialLabel(href).slice(0, 2);
}

function iconSvg(name) {
  const icons = {
    behance: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 11.3c1.4 0 2.2-.8 2.2-2s-.9-2-2.7-2H3v9h5c2.4 0 3.6-1.2 3.6-2.9 0-1.4-.9-2.1-2.4-2.1Zm-2.7-3.1h2c.9 0 1.5.4 1.5 1.2s-.6 1.3-1.5 1.3h-2V8.2Zm2.2 6.2H5.5v-2.1h2.2c1 0 1.7.4 1.7 1.1 0 .8-.6 1-1.7 1Zm7.7-6.5h3.7v-.9h-3.7v.9Zm1.9 1.1c-2.7 0-4.3 1.9-4.3 4.2 0 2.4 1.5 4.2 4.3 4.2 2.1 0 3.5-1.1 3.9-2.8h-2c-.2.6-.8 1.1-1.8 1.1-1.2 0-2-.8-2-1.9h5.9c.2-2.7-1.3-4.8-4-4.8Zm-1.9 3.3c.1-1 .8-1.7 1.9-1.7 1 0 1.7.7 1.8 1.7h-3.7Z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 8.7A1.6 1.6 0 1 0 6.4 5.5a1.6 1.6 0 0 0 0 3.2ZM5 10h2.8v9H5v-9Zm4.4 0h2.7v1.2h.04c.38-.72 1.3-1.48 2.68-1.48 2.87 0 3.4 1.9 3.4 4.35V19h-2.8v-4.37c0-1.04-.02-2.39-1.46-2.39-1.46 0-1.68 1.14-1.68 2.31V19H9.4v-9Z"/></svg>`,
    vimeo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 7.2c-.1 2.6-1.9 6.1-5.4 10.4-3.6 4.6-6.7 6.8-9.3 6.8-1.6 0-2.9-1.5-4-4.5l-1.5-5.4c-.6-2-1.2-3-1.8-3-.1 0-.8.4-2 1.3L-4.6 11c1.4-1.2 2.8-2.4 4.1-3.7 1.8-1.6 3.2-2.5 4.1-2.6 2.2-.2 3.5 1.3 4 4.3.6 3 1 4.9 1.2 5.6.7 2.5 1.4 3.7 2.2 3.7.6 0 1.5-.8 2.8-2.4 1.2-1.6 1.9-2.9 2-3.9.2-1.5-.4-2.2-1.8-2.2-.7 0-1.5.2-2.3.5 1.5-4.8 4.3-7.2 8.4-7.1 3 .1 4.4 1.8 4.3 5Z"/></svg>`,
    github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.2 6.9 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6 0-.6 0-.6 1 .1 1.6 1 1.6 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.2-.3-4.5-1.1-4.5-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.8 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 2-1.3 2.8-1 2.8-1 .6 1.5.2 2.5.1 2.8.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.5 5 .4.3.8 1 .8 2v3c0 .3.2.6.7.5 4-1.4 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2Z"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm8 5 8-5H4l8 5Zm0 2L4 8v8h16V8l-8 5Z"/></svg>`,
    arrowBack: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5v-3h7v-4h-7V7Z"/></svg>`,
    northEast: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`,
    close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3 1.4 1.4Z"/></svg>`
  };
  return icons[name] || "";
}

function socialIconName(href) {
  if (href.includes("behance")) return "behance";
  if (href.includes("linkedin")) return "linkedin";
  if (href.includes("vimeo")) return "vimeo";
  if (href.includes("github")) return "github";
  if (href.startsWith("mailto:")) return "mail";
  return "mail";
}

function assetPath(value, depth = 0) {
  if (!value || /^https?:\/\//.test(value) || value.startsWith("mailto:")) {
    return value;
  }
  return `${"../".repeat(depth)}${value}`;
}

function normalizeAnalyticsRoute(route = "/") {
  const trimmed = route.replace(/\/index\.html$/, "/").replace(/\/+/g, "/");
  if (trimmed === "/" || trimmed === "") return "/";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function analyticsCounterName(route = "/") {
  const normalized = normalizeAnalyticsRoute(route);
  if (normalized === "/") return "home";
  return normalized
    .replace(/^\/|\/$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\//g, "__");
}

const analyticsPages = [
  { label: "Home", route: "/" },
  { label: "Analytics", route: "/analytics/" },
  { label: "Beatbox", route: "/beatbox/" },
  { label: "Canvas App", route: "/canvas-app/" },
  { label: "CodePlayer", route: "/codeplayer/" },
  { label: "Felipeu", route: "/felipeu/" },
  { label: "Mixology Cards", route: "/mixology-cards/" },
  { label: "Quote Machine", route: "/quote-machine/" },
  { label: "Sunny Dublin", route: "/sunny-dublin/" },
  ...data.projects.map((project) => ({
    label: project.title,
    route: `/projects/${project.slug}/`
  }))
];

function renderAnalyticsBootstrap() {
  return `
    <script>
      (() => {
        const namespace = ${JSON.stringify(ANALYTICS_NAMESPACE)};
        const trackedRoutes = new Set();

        function normalizeRoute(route) {
          const trimmed = (route || "/").replace(/\\/index\\.html$/, "/").replace(/\\/+/g, "/");
          if (trimmed === "/" || trimmed === "") return "/";
          return trimmed.endsWith("/") ? trimmed : trimmed + "/";
        }

        function counterName(route) {
          const normalized = normalizeRoute(route);
          if (normalized === "/") return "home";
          return normalized
            .replace(/^\\//, "")
            .replace(/\\/$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9/_-]+/g, "-")
            .replace(/\\//g, "__");
        }

        function activeCounterName(route) {
          return counterName(route) + "__active";
        }

        function pingCounter(name) {
          const url =
            "https://api.counterapi.dev/v1/" +
            encodeURIComponent(namespace) +
            "/" +
            encodeURIComponent(name) +
            "/up";

          fetch(url, { method: "GET", keepalive: true }).catch(() => {});
        }

        const activeBucketMs = ${ANALYTICS_ACTIVE_BUCKET_SECONDS} * 1000;
        let activeRoute = null;
        let activeStartedAt = 0;
        let activeCarryMs = 0;
        let activeTimer = null;

        function flushActiveTime(finalize = false) {
          if (!activeRoute || !activeStartedAt) return;

          const now = Date.now();
          activeCarryMs += Math.max(0, now - activeStartedAt);
          activeStartedAt = now;

          while (activeCarryMs >= activeBucketMs) {
            pingCounter(activeCounterName(activeRoute));
            activeCarryMs -= activeBucketMs;
          }

          if (finalize && activeCarryMs >= activeBucketMs / 2) {
            pingCounter(activeCounterName(activeRoute));
            activeCarryMs = 0;
          }
        }

        function stopActiveTimer(finalize = false) {
          flushActiveTime(finalize);
          activeStartedAt = 0;
          if (activeTimer) {
            clearInterval(activeTimer);
            activeTimer = null;
          }
        }

        function ensureActiveTimer() {
          if (document.visibilityState !== "visible" || activeTimer) return;
          activeTimer = setInterval(() => flushActiveTime(false), activeBucketMs);
        }

        function setActiveRoute(route) {
          const normalized = normalizeRoute(route);
          const changedRoute = activeRoute !== normalized;

          if (changedRoute) {
            stopActiveTimer(true);
            activeRoute = normalized;
            activeCarryMs = 0;
          }

          if (document.visibilityState === "visible") {
            activeStartedAt = Date.now();
            ensureActiveTimer();
          }
        }

        function trackPageView(route) {
          const normalized = normalizeRoute(route);
          if (!trackedRoutes.has(normalized)) {
            trackedRoutes.add(normalized);
            pingCounter(counterName(normalized));
          }

          setActiveRoute(normalized);
        }

        window.__FS_ANALYTICS__ = {
          namespace,
          trackPageView,
          setActiveRoute
        };

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            stopActiveTimer(true);
            return;
          }

          if (activeRoute) {
            activeStartedAt = Date.now();
            ensureActiveTimer();
          }
        });

        window.addEventListener("pagehide", () => stopActiveTimer(true));

        trackPageView(window.location.pathname);
      })();
    </script>
  `;
}

function projectCover(project) {
  return assets.covers?.[project.slug] || project.cover;
}

function projectModuleAsset(project, index, module) {
  if (module.type === "image") {
    return assets.modules?.[`${project.slug}:${index + 1}`] || module.src;
  }

  if (module.type === "embed") {
    return assets.embeds?.[`${project.slug}:${index + 1}`] || null;
  }

  return null;
}

function layout({ title, description, body, depth = 0 }) {
  const prefix = "../".repeat(depth);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Raleway:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${prefix}styles.css" />
  </head>
  <body>
    ${body}
    ${renderAnalyticsBootstrap()}
  </body>
</html>
`;
}

function renderHeader(active) {
  return `
    <header class="site-header">
      <a class="brand" aria-label="${escapeHtml(data.home.siteTitle)}" href="${active === "home" ? "./index.html" : "../../index.html"}">FS<span class="brand-dot">.</span></a>
      <nav class="site-nav" aria-label="Primary">
        <a href="${active === "home" ? "#design" : "../../index.html#design"}">Design</a>
        <a href="${active === "home" ? "#about" : "../../index.html#about"}">About</a>
        <a href="${active === "home" ? "#contact" : "../../index.html#contact"}">Contact</a>
      </nav>
    </header>
  `;
}

function renderProjectCard(project) {
  return `
    <article class="project-card">
      <a href="./projects/${project.slug}/index.html" class="project-link" data-project-trigger="${escapeHtml(project.slug)}">
        <div class="project-image-wrap">
          <img src="${escapeHtml(assetPath(projectCover(project), 0))}" alt="${escapeHtml(project.title)} cover" loading="lazy" />
          <div class="project-overlay">
            <p class="project-year">${escapeHtml(project.year)}</p>
            <h3>${escapeHtml(project.title)}</h3>
          </div>
        </div>
        <div class="project-copy">
          <h3>${escapeHtml(project.title)}</h3>
        </div>
      </a>
    </article>
  `;
}

function renderFeaturedProject(project, index) {
  const previewText = truncateText(project.summary.split("\n\n")[0] || project.summary.split("\n")[0] || "", 210);
  return `
    <article class="featured-project ${index % 2 === 1 ? "featured-project-reverse" : ""}">
      <div class="featured-copy">
        <p class="featured-year">${escapeHtml(project.year)}</p>
        <h2>${escapeHtml(project.title)}</h2>
        ${previewText ? `<p class="featured-summary">${escapeHtml(previewText)}</p>` : ""}
        <a href="./projects/${project.slug}/index.html" class="featured-link" data-project-trigger="${escapeHtml(project.slug)}">
          <span>View project</span>
          ${iconSvg("northEast")}
        </a>
      </div>
      <a href="./projects/${project.slug}/index.html" class="featured-media" data-project-trigger="${escapeHtml(project.slug)}">
        <img src="${escapeHtml(assetPath(projectCover(project), 0))}" alt="${escapeHtml(project.title)} cover" loading="lazy" />
      </a>
    </article>
  `;
}

function renderModule(project, module, index, depth = 0) {
  if (module.type === "text") {
    const paragraphs = module.text
      .split("\n")
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
    return `<section class="module module-text">${paragraphs}</section>`;
  }

  if (module.type === "image") {
    const src = projectModuleAsset(project, index, module) || module.src;
    return `
      <figure class="module module-image">
        <img src="${escapeHtml(assetPath(src, depth))}" alt="${escapeHtml(module.caption || "Project visual")}" loading="lazy" />
        ${module.caption ? `<figcaption>${escapeHtml(module.caption)}</figcaption>` : ""}
      </figure>
    `;
  }

  if (module.type === "embed") {
    const embed = projectModuleAsset(project, index, module);
    const poster = embed?.poster || "";
    return `
      <section class="module module-embed">
        <a class="video-card" href="${module.src}" target="_blank" rel="noreferrer">
          ${poster ? `<img src="${escapeHtml(assetPath(poster, depth))}" alt="Video preview" loading="lazy" />` : `<div class="video-fallback">Watch video</div>`}
          <span class="video-pill">Open video</span>
        </a>
      </section>
    `;
  }

  return "";
}

function projectPayload(project) {
  return {
    slug: project.slug,
    title: project.title,
    year: project.year,
    modules: project.modules.map((module, index) => {
      if (module.type === "image") {
        return {
          type: "image",
          src: assetPath(projectModuleAsset(project, index, module) || module.src, 0),
          caption: module.caption || ""
        };
      }

      if (module.type === "embed") {
        const embed = projectModuleAsset(project, index, module);
        return {
          type: "embed",
          src: module.src,
          poster: embed?.poster ? assetPath(embed.poster, 0) : "",
          caption: ""
        };
      }

      return {
        type: "text",
        text: module.text || ""
      };
    })
  };
}

const modalProjects = data.projects.map(projectPayload);
const featuredProjects = data.projects;
const introSocials = data.home.socials
  .map(
    (href) =>
      `<a href="${href}" target="_blank" rel="noreferrer">${escapeHtml(socialLabel(href))}</a>`
  )
  .join("");

const homeBody = `
  <div class="page-shell">
    ${renderHeader("home")}
    <main>
      <section class="intro-section">
        <p class="eyebrow">Felipe Soares</p>
        <div class="intro-main">
          <h1>
            <span>Product design</span>
            <span>for digital products,</span>
            <span>systems, and</span>
            <span>brand moments.</span>
          </h1>
          <div class="intro-links" aria-label="Social links">${introSocials}</div>
        </div>
      </section>

      <section class="design-section" id="design">
        <div class="section-label">
          <p class="eyebrow">Design</p>
        </div>
        <section class="featured-stack">
          ${featuredProjects.map(renderFeaturedProject).join("")}
        </section>
      </section>

      <section class="about-section" id="about">
        <div class="about-heading">
          <p class="eyebrow">About</p>
          <h2>Designing clearer product experiences with a focus on usability, narrative, and systems thinking.</h2>
        </div>
        <div class="about-body">
          <p>Felipe is a product designer based in Dublin, building interfaces across fintech, travel, healthcare, and brand work. This portfolio brings together case studies, experiments, and interface explorations from the last several years.</p>
          <p>The work tends to focus on making complex products easier to navigate, easier to trust, and more engaging to use over time.</p>
        </div>
      </section>

      <section class="contact-panel" id="contact">
        <p class="eyebrow">${escapeHtml(data.contact.title)}</p>
        <h2>Let’s talk.</h2>
        <a class="contact-link" href="${data.contact.email}">${escapeHtml(data.contact.email.replace("mailto:", ""))}</a>
      </section>
    </main>

    <div class="project-modal" id="project-modal" hidden>
      <div class="project-modal-backdrop" data-project-close></div>
      <section class="project-modal-sheet" aria-modal="true" role="dialog" aria-labelledby="project-modal-title">
        <button class="project-modal-close" type="button" aria-label="Close project" data-project-close>${iconSvg("close")}</button>
        <div class="project-modal-inner" id="project-modal-content"></div>
      </section>
    </div>
  </div>
  <script>
    window.__PROJECTS__ = ${JSON.stringify(modalProjects)};
    (() => {
      const projects = new Map(window.__PROJECTS__.map((project) => [project.slug, project]));
      const modal = document.getElementById("project-modal");
      const content = document.getElementById("project-modal-content");
      const closeButtons = modal.querySelectorAll("[data-project-close]");
      const triggers = document.querySelectorAll("[data-project-trigger]");

      function renderModule(module) {
        if (module.type === "text") {
          const paragraphs = module.text
            .split("\\n")
            .filter(Boolean)
            .map((paragraph) => '<p>' + paragraph.replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char])) + '</p>')
            .join("");
          return '<section class="modal-module modal-text">' + paragraphs + '</section>';
        }

        if (module.type === "image") {
          const caption = module.caption ? '<figcaption>' + module.caption.replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char])) + '</figcaption>' : "";
          return '<figure class="modal-module modal-image"><img src="' + module.src + '" alt="' + (module.caption || "Project visual").replace(/"/g, '&quot;') + '" loading="lazy" />' + caption + '</figure>';
        }

        const poster = module.poster ? '<img src="' + module.poster + '" alt="Video preview" loading="lazy" />' : '<div class="video-fallback">Watch video</div>';
        return '<section class="modal-module modal-embed"><a class="video-card" href="' + module.src + '" target="_blank" rel="noreferrer">' + poster + '<span class="video-pill">Open video</span></a></section>';
      }

      function openProject(slug) {
        const project = projects.get(slug);
        if (!project) return;

        content.innerHTML =
          '<header class="modal-header">' +
            '<p class="eyebrow">' + project.year + '</p>' +
            '<h2 id="project-modal-title">' + project.title + '</h2>' +
          '</header>' +
          '<div class="modal-stack">' + project.modules.map(renderModule).join("") + '</div>';

        modal.hidden = false;
        document.body.classList.add("modal-open");
        history.replaceState(null, "", "#project-" + slug);
        window.__FS_ANALYTICS__?.trackPageView("/projects/" + slug + "/");
      }

      function closeProject() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        history.replaceState(null, "", window.location.pathname + window.location.search);
        window.__FS_ANALYTICS__?.setActiveRoute(window.location.pathname);
      }

      triggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
          event.preventDefault();
          openProject(trigger.getAttribute("data-project-trigger"));
        });
      });

      closeButtons.forEach((button) => {
        button.addEventListener("click", closeProject);
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
          closeProject();
        }
      });

      const hash = window.location.hash;
      if (hash.startsWith("#project-")) {
        openProject(hash.replace("#project-", ""));
      }
    })();
  </script>
`;

writeFileSync(
  path.join(outputDir, "index.html"),
  layout({
    title: data.home.siteTitle,
    description: data.home.metaDescription,
    body: homeBody
  })
);

for (const project of data.projects) {
  const projectPath = path.join(projectsDir, project.slug);
  mkdirSync(projectPath, { recursive: true });

  const projectBody = `
    <div class="page-shell">
      ${renderHeader("project")}
      <main class="project-page">
        <div class="project-nav">
          <a class="back-link" href="../../index.html#design">${iconSvg("arrowBack")}Back to design</a>
          <div class="project-nav-links">
            <a href="../../index.html#design">Design</a>
            <a href="../../index.html#about">About</a>
            <a href="../../index.html#contact">Contact</a>
          </div>
        </div>
        <section class="project-hero">
          <p class="eyebrow">${escapeHtml(project.year)}</p>
          <h1>${escapeHtml(project.title)}</h1>
        </section>
        <section class="project-stack">
          ${project.modules.map((module, index) => renderModule(project, module, index, 2)).join("")}
        </section>
      </main>
    </div>
  `;

  writeFileSync(
    path.join(projectPath, "index.html"),
    layout({
      title: `${project.title} | ${data.home.siteTitle}`,
      description: project.summary.split("\n")[0] || data.home.metaDescription,
      body: projectBody,
      depth: 2
    })
  );
}

const analyticsBody = `
  <div class="page-shell">
    ${renderHeader("analytics")}
    <main class="analytics-page">
      <section class="analytics-hero">
        <p class="eyebrow">Analytics</p>
        <h1>Simple page analytics</h1>
        <p class="analytics-note">This is a lightweight pageview tracker for the portfolio and its project pages. Counts update as pages are visited, project modals are opened from the homepage, and average active time is estimated in ${ANALYTICS_ACTIVE_BUCKET_SECONDS}-second buckets while a page stays visible.</p>
      </section>

      <section class="analytics-panel">
        <div class="analytics-total-card">
          <span>Total tracked views</span>
          <strong id="analytics-total">...</strong>
        </div>
        <div class="analytics-list" id="analytics-list"></div>
        <p class="analytics-error" id="analytics-error" hidden>Analytics could not be loaded right now.</p>
      </section>
    </main>
  </div>
  <script>
    (() => {
      const namespace = ${JSON.stringify(ANALYTICS_NAMESPACE)};
      const activeBucketSeconds = ${ANALYTICS_ACTIVE_BUCKET_SECONDS};
      const pages = ${JSON.stringify(analyticsPages)};
      const totalEl = document.getElementById("analytics-total");
      const listEl = document.getElementById("analytics-list");
      const errorEl = document.getElementById("analytics-error");

      function counterName(route) {
        const normalized = (route || "/").replace(/\\/index\\.html$/, "/").replace(/\\/+/g, "/");
        if (normalized === "/" || normalized === "") return "home";
        const routeWithSlash = normalized.endsWith("/") ? normalized : normalized + "/";
        return routeWithSlash
          .replace(/^\\//, "")
          .replace(/\\/$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9/_-]+/g, "-")
          .replace(/\\//g, "__");
      }

      function fetchCount(route) {
        const url =
          "https://api.counterapi.dev/v1/" +
          encodeURIComponent(namespace) +
          "/" +
          encodeURIComponent(counterName(route)) +
          "/";

        return fetch(url)
          .then((response) => {
            if (response.status === 400) return { count: 0 };
            if (!response.ok) throw new Error("Bad response");
            return response.json();
          })
          .then((json) => Number(json.count || 0));
      }

      function fetchActiveBuckets(route) {
        const url =
          "https://api.counterapi.dev/v1/" +
          encodeURIComponent(namespace) +
          "/" +
          encodeURIComponent(counterName(route) + "__active") +
          "/";

        return fetch(url)
          .then((response) => {
            if (response.status === 400) return { count: 0 };
            if (!response.ok) throw new Error("Bad response");
            return response.json();
          })
          .then((json) => Number(json.count || 0));
      }

      function formatDuration(seconds) {
        const rounded = Math.max(0, Math.round(seconds));
        if (!rounded) return "0s";
        const minutes = Math.floor(rounded / 60);
        const remainder = rounded % 60;
        if (!minutes) return remainder + "s";
        if (!remainder) return minutes + "m";
        return minutes + "m " + remainder + "s";
      }

      Promise.all(
        pages.map(async (page) => ({
          ...page,
          count: await fetchCount(page.route)
        }))
      )
        .then((results) =>
          Promise.all(
            results.map(async (item) => ({
              ...item,
              activeBuckets: item.count ? await fetchActiveBuckets(item.route) : 0
            }))
          )
        )
        .then((results) => {
          const sorted = results
            .map((item) => ({
              ...item,
              averageSeconds: item.count ? (item.activeBuckets * activeBucketSeconds) / item.count : 0
            }))
            .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
          const total = sorted.reduce((sum, item) => sum + item.count, 0);
          totalEl.textContent = total.toLocaleString();
          listEl.innerHTML = sorted
            .map(
              (item) =>
                '<article class="analytics-item">' +
                  '<div>' +
                    '<p class="analytics-item-label">' + item.label.replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char])) + '</p>' +
                    '<p class="analytics-item-route">' + item.route.replace(/[&<>"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char])) + '</p>' +
                  '</div>' +
                  '<div class="analytics-item-stats">' +
                    '<strong>' + item.count.toLocaleString() + '</strong>' +
                    '<p class="analytics-item-meta">Avg active time ' + formatDuration(item.averageSeconds) + '</p>' +
                  '</div>' +
                '</article>'
            )
            .join("");
        })
        .catch(() => {
          totalEl.textContent = "--";
          errorEl.hidden = false;
        });
    })();
  </script>
`;

writeFileSync(
  path.join(analyticsDir, "index.html"),
  layout({
    title: `Analytics | ${data.home.siteTitle}`,
    description: "Simple page analytics for Felipe Soares portfolio.",
    body: analyticsBody,
    depth: 1
  })
);

const styles = `
:root {
  --bg: #090d11;
  --bg-soft: #0d131a;
  --panel: #111820;
  --panel-strong: #151f29;
  --surface: rgba(255, 255, 255, 0.04);
  --surface-strong: rgba(255, 255, 255, 0.07);
  --text: #f3f5f7;
  --muted: #9aa7b5;
  --soft: #6f7c89;
  --line: rgba(255, 255, 255, 0.09);
  --line-strong: rgba(255, 255, 255, 0.14);
  --accent: #e2a25d;
  --accent-soft: rgba(226, 162, 93, 0.14);
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  --max: 1320px;
  --sans: "Raleway", "Helvetica Neue", "Segoe UI", sans-serif;
  --serif: "Merriweather", Georgia, serif;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  font-family: var(--sans);
  background:
    radial-gradient(circle at top, rgba(226, 162, 93, 0.1), transparent 28%),
    linear-gradient(180deg, #0b1116 0%, #090d11 100%);
}

body.modal-open {
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  max-width: 100%;
}

main {
  display: grid;
}

.page-shell {
  width: min(calc(100% - 2.5rem), var(--max));
  margin: 0 auto;
  padding-bottom: 4rem;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 0;
  background: rgba(9, 13, 17, 0.82);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid var(--line);
}

.brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.05rem;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.06em;
}

.brand-dot {
  color: var(--accent);
}

.site-nav,
.project-nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.site-nav {
  justify-content: flex-end;
}

.site-nav a,
.project-nav-links a {
  position: relative;
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 180ms ease;
}

.site-nav a::after,
.project-nav-links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.35rem;
  width: 100%;
  height: 1px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 180ms ease;
}

.site-nav a:hover,
.project-nav-links a:hover,
.site-nav a:focus-visible,
.project-nav-links a:focus-visible {
  color: var(--text);
}

.site-nav a:hover::after,
.project-nav-links a:hover::after,
.site-nav a:focus-visible::after,
.project-nav-links a:focus-visible::after {
  transform: scaleX(1);
}

.contact-link,
.back-link,
.featured-link,
.project-modal-close {
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    opacity 180ms ease;
}

.project-modal-close svg,
.back-link svg,
.featured-link svg {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
  flex: none;
}

.eyebrow,
.featured-year,
.project-year {
  margin: 0;
  font-size: 0.73rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--soft);
}

.intro-section,
.design-section,
.about-section,
.contact-panel,
.project-hero,
.module,
.modal-module {
  border-top: 1px solid var(--line);
}

.intro-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;
  min-height: 80svh;
  align-content: center;
  padding: 2.5rem 0 4rem;
}

.intro-section .eyebrow {
  padding-top: 0;
  align-self: start;
}

.intro-main {
  display: grid;
  align-content: center;
  gap: 1.5rem;
  max-width: min(100%, 86rem);
}

.intro-section h1 {
  margin: 0;
  max-width: none;
  font-family: var(--serif);
  font-size: clamp(3.2rem, 7.1vw, 6.9rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.intro-section h1 span {
  display: block;
}

.intro-links,
.featured-summary,
.project-summary,
.module-text p,
figcaption,
.about-body p,
.modal-text p {
  color: var(--muted);
  line-height: 1.75;
  font-size: 1rem;
}

.intro-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem 1.2rem;
  max-width: 34rem;
  margin: 0;
  font-size: 0.96rem;
}

.intro-links a {
  color: var(--muted);
  transition: color 180ms ease;
}

.intro-links a:hover,
.intro-links a:focus-visible {
  color: var(--text);
}

.design-section {
  padding-top: 1rem;
}

.section-label {
  margin-bottom: 1.75rem;
}

.featured-stack {
  display: grid;
  gap: 7.5rem;
}

.featured-project {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
  gap: 2.5rem clamp(3.75rem, 6vw, 6rem);
  align-items: stretch;
  padding-top: 2rem;
  border-top: 1px solid var(--line);
  min-height: clamp(30rem, 72svh, 42rem);
}

.featured-project-reverse .featured-copy {
  order: 2;
}

.featured-project-reverse .featured-media {
  order: 1;
}

.featured-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 2rem;
  max-width: 31rem;
  padding-block: 1rem;
  padding-right: clamp(0rem, 1.5vw, 1.25rem);
}

.featured-copy h2,
.about-heading h2,
.contact-panel h2,
.project-hero h1,
.modal-header h2 {
  margin: 0;
  font-family: var(--serif);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.featured-copy h2 {
  margin-top: 0;
  color: var(--accent);
  font-size: clamp(2.6rem, 4.2vw, 4.5rem);
  max-width: 10ch;
  min-height: 2.2em;
}

.featured-summary {
  margin: 0;
  max-width: 30rem;
  min-height: calc(1rem * 1.75 * 4);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.featured-link {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  justify-self: start;
  width: fit-content;
  margin-top: 0;
  padding: 0.85rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(226, 162, 93, 0.25);
  background: var(--accent-soft);
  color: var(--text);
  font-size: 0.92rem;
  font-weight: 600;
}

.featured-link:hover,
.featured-link:focus-visible {
  transform: translateY(-1px);
  background: rgba(226, 162, 93, 0.2);
  border-color: rgba(226, 162, 93, 0.45);
}

.featured-link svg {
  fill: none;
}

.featured-media {
  display: block;
  position: relative;
  overflow: hidden;
  height: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 1.6rem;
  border: 1px solid var(--line);
  background: linear-gradient(145deg, #111821, #0b1016);
  box-shadow: var(--shadow);
}

.featured-media::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 35%;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.24));
}

.featured-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 3.5rem;
}

.project-card {
  min-width: 0;
}

.project-link {
  display: grid;
  gap: 0.9rem;
}

.project-image-wrap {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border-radius: 1.15rem;
  border: 1px solid var(--line);
  background: linear-gradient(150deg, #131a22, #0c1117);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.project-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 260ms ease, filter 260ms ease;
}

.project-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(180deg, rgba(2, 4, 6, 0.08), rgba(2, 4, 6, 0.7));
  opacity: 0;
  transition: opacity 220ms ease;
}

.project-year {
  align-self: flex-start;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  color: var(--text);
  background: rgba(8, 11, 15, 0.68);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.project-overlay h3 {
  margin: 0;
  max-width: 11ch;
  color: white;
  font-family: var(--serif);
  font-size: 1.35rem;
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.project-copy h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.3;
}

.project-card:hover .project-image-wrap img,
.project-card:focus-within .project-image-wrap img {
  transform: scale(1.04);
  filter: saturate(1.02);
}

.project-card:hover .project-overlay,
.project-card:focus-within .project-overlay {
  opacity: 1;
}

.about-section,
.contact-panel,
.project-hero {
  padding-top: 4rem;
  margin-top: 4rem;
}

.about-section {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 2rem 4rem;
}

.about-heading h2,
.contact-panel h2 {
  font-size: clamp(2.2rem, 3.5vw, 3.5rem);
}

.about-body {
  display: grid;
  gap: 1.1rem;
  max-width: 34rem;
}

.about-body p,
.contact-panel p,
.module-text p,
.modal-text p {
  margin: 0;
}

.contact-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 1.5rem 2rem;
}

.contact-link,
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: fit-content;
  padding: 0.82rem 1.05rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text);
  font-weight: 500;
}

.contact-link:hover,
.contact-link:focus-visible,
.back-link:hover,
.back-link:focus-visible {
  transform: translateY(-1px);
  background: var(--surface-strong);
  border-color: var(--line-strong);
}

.back-link svg {
  width: 0.95rem;
  height: 0.95rem;
}

.project-page {
  display: grid;
  gap: 2rem;
  padding-top: 1rem;
}

.project-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
}

.project-nav-links a {
  color: var(--soft);
}

.project-hero {
  margin-top: 0;
}

.project-hero h1,
.modal-header h2 {
  color: var(--accent);
  font-size: clamp(2.7rem, 5vw, 4.9rem);
}

.project-summary {
  max-width: 46rem;
  margin-top: 1rem;
}

.project-stack,
.modal-stack {
  display: grid;
  gap: 1.5rem;
}

.module,
.modal-module {
  padding-top: 1.25rem;
}

.module-text,
.modal-text {
  max-width: 56rem;
}

.module-text p:first-child,
.modal-text p:first-child {
  margin-top: 0;
}

.module-image img,
.modal-image img,
.video-card {
  width: 100%;
  overflow: hidden;
  border-radius: 1.1rem;
}

.module-image img,
.modal-image img {
  background: var(--bg-soft);
  border: 1px solid var(--line);
}

figcaption {
  margin-top: 0.8rem;
  max-width: 42rem;
  color: var(--soft);
}

.video-card {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #151d26, #0c1117);
  border: 1px solid var(--line);
}

.video-card img,
.video-fallback {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-fallback {
  display: grid;
  place-items: center;
  color: var(--text);
  font-family: var(--serif);
  font-size: clamp(1.5rem, 3vw, 2.2rem);
}

.video-pill {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.55rem 0.8rem;
  border-radius: 999px;
  background: rgba(6, 9, 12, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.project-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
}

.project-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(2, 5, 8, 0.72);
  backdrop-filter: blur(10px);
}

.project-modal-sheet {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 14, 18, 0.98), rgba(8, 11, 15, 0.98));
}

.project-modal-inner {
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4.5rem 0 4rem;
}

.project-modal-inner > * {
  width: min(calc(100% - 2.5rem), 1080px);
  margin-inline: auto;
}

.project-modal-close {
  position: fixed;
  top: 1.1rem;
  right: 1.1rem;
  z-index: 2;
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(13, 19, 26, 0.9);
  color: var(--text);
  cursor: pointer;
}

.project-modal-close:hover,
.project-modal-close:focus-visible {
  transform: translateY(-1px);
  background: rgba(17, 24, 32, 0.95);
  border-color: var(--line-strong);
}

.analytics-page {
  gap: 2rem;
  padding-top: 2rem;
}

.analytics-hero {
  display: grid;
  gap: 1rem;
  max-width: 46rem;
}

.analytics-hero h1 {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2.8rem, 6vw, 4.8rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.analytics-note,
.analytics-error,
.analytics-item-route,
.analytics-item-meta {
  margin: 0;
  color: var(--muted);
}

.analytics-panel {
  display: grid;
  gap: 1rem;
}

.analytics-total-card,
.analytics-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.25rem;
  border: 1px solid var(--line);
  border-radius: 1.35rem;
  background: rgba(17, 24, 32, 0.7);
}

.analytics-total-card span,
.analytics-item-label {
  margin: 0;
  font-weight: 600;
}

.analytics-total-card strong,
.analytics-item strong {
  font-size: 1.3rem;
  font-weight: 700;
}

.analytics-item-stats {
  display: grid;
  justify-items: end;
  gap: 0.35rem;
}

.analytics-item-meta {
  font-size: 0.88rem;
  text-align: right;
}

.analytics-list {
  display: grid;
  gap: 0.85rem;
}

.analytics-item {
  align-items: flex-start;
}

.modal-header {
  padding-right: 4rem;
}

.modal-header h2 {
  max-width: 12ch;
}

.modal-stack {
  margin-top: 2rem;
}

@media (max-width: 1100px) {
  .featured-project,
  .about-section {
    grid-template-columns: 1fr;
  }

  .intro-section {
    gap: 1rem;
  }

  .featured-project-reverse .featured-copy,
  .featured-project-reverse .featured-media {
    order: initial;
  }

  .featured-media {
    aspect-ratio: 16 / 10;
    height: auto;
  }
}

@media (max-width: 900px) {
  .site-header {
    grid-template-columns: 1fr;
  }

  .site-nav {
    justify-content: flex-start;
  }

  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .contact-panel,
  .project-nav {
    grid-template-columns: 1fr;
  }

  .project-nav {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .page-shell,
  .project-modal-inner > * {
    width: min(calc(100% - 1rem), var(--max));
  }

  .site-header {
    padding: 0.85rem 0;
  }

  .site-nav,
  .project-nav-links {
    gap: 0.75rem;
  }

  .intro-section {
    min-height: 80svh;
    padding: 2rem 0 3rem;
  }

  .intro-section h1 {
    font-size: clamp(2.5rem, 11vw, 3.7rem);
  }

  .featured-copy h2,
  .about-heading h2,
  .contact-panel h2,
  .project-hero h1,
  .modal-header h2 {
    font-size: clamp(2.1rem, 11vw, 3.1rem);
  }

  .featured-project,
  .about-section,
  .contact-panel {
    gap: 1.25rem;
  }

  .featured-copy {
    padding-right: 0;
  }

  .featured-project {
    min-height: auto;
  }

  .project-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .about-section,
  .contact-panel,
  .project-hero {
    padding-top: 3rem;
    margin-top: 3rem;
  }

  .project-modal-inner {
    padding-top: 4rem;
    padding-bottom: 2rem;
  }

  .project-modal-close {
    top: 0.75rem;
    right: 0.75rem;
    width: 2.75rem;
    height: 2.75rem;
  }

  .modal-header {
    padding-right: 3rem;
  }
}
`;

writeFileSync(path.join(outputDir, "styles.css"), styles.trimStart());
writeFileSync(path.join(outputDir, "404.html"), readFileSync(path.join(outputDir, "index.html"), "utf8"));

console.log(`Built site with ${data.projects.length} project pages in ${outputDir}`);
