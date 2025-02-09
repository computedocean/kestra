import markdownIt from "markdown-it";
import mark from "markdown-it-mark";
import meta from "markdown-it-meta";
import anchor from "markdown-it-anchor";
import container from "markdown-it-container";
import {fromHighlighter} from "@shikijs/markdown-it/core";
import {createHighlighterCore} from "shiki/core";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import {linkTag} from "./markdown_plugins/link";

let highlighter = null;

async function getHighlighter() {
    if (!highlighter) {
        highlighter = createHighlighterCore({
            langs: [import("shiki/langs/yaml.mjs"), import("shiki/langs/python.mjs"), import("shiki/langs/javascript.mjs")],
            themes: [githubDark, githubLight],
            loadWasm: import("shiki/wasm"),
        });
    }
    return highlighter;
}

export default class Markdown {
    static async render(markdown, options) {
        const highlighter = await getHighlighter();

        githubDark["colors"]["editor.background"] = "var(--bs-gray-500)";
        githubLight["colors"]["editor.background"] = "var(--bs-white)";

        options = options || {};

        const darkTheme = document.getElementsByTagName("html")[0].className.indexOf("dark") >= 0;

        let md;
        if (options.onlyLink) {
            md = new markdownIt("zero");
            md.enable(["link", "linkify", "entity", "html_inline", "newline"]);
        } else {
            md = new markdownIt();
        }

        md.use(mark)
            .use(meta)
            .use(anchor, {permalink: options.permalink ? anchor.permalink.ariaHidden({placement: "before"}) : undefined})
            .use(container, "warning")
            .use(container, "info")
            .use(fromHighlighter(highlighter, {theme: darkTheme ? "github-dark" : "github-light"}))
            .use(linkTag);

        md.set({
            html: true,
            xhtmlOut: true,
            breaks: true,
            linkify: true,
            typographer: true,
            langPrefix: "language-",
            quotes: "“”‘’",
        });

        md.renderer.rules.table_open = () => "<table class=\"table\">\n";

        return md.render(markdown);
    }
}
