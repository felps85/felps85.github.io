(() => {
  const namespace = "sunnypubs-ie";
  const trimmed = (window.location.pathname || "/").replace(/\/index\.html$/, "/").replace(/\/+/g, "/");
  const route = trimmed === "" || trimmed === "/" ? "/" : trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
  const counter = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").toLowerCase().replace(/[^a-z0-9/_-]+/g, "-").replace(/\//g, "__");

  fetch(
    "https://api.counterapi.dev/v1/" +
      encodeURIComponent(namespace) +
      "/" +
      encodeURIComponent(counter) +
      "/up",
    { method: "GET", keepalive: true }
  ).catch(() => {});
})();
