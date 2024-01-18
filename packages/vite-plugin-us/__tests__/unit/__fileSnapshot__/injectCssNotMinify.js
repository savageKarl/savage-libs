;((options2) => {
    window.addEventListener("DOMContentLoaded", () => {
      options2.links.forEach((v) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = v;
        document.head.appendChild(link);
      });
      if (options2.inline) {
        const style = document.createElement("style");
        style.dataset.vitePluginId = options2.pluginName;
        style.textContent = options2.inline;
        document.head.appendChild(style);
      }
    });
  })({"links":["abc.css","foo.css"],"minify":false,"pluginName":"vite-plugin-us","inline":"<style> h1 {color: blue}</style>"});