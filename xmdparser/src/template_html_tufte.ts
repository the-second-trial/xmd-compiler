import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

import { DocumentInfo, Template } from "./template";
import { ResourceManager } from "./res_manager";

export interface HtmlTufteTemplateOptions {
    outputPsth: string;
}

/** Describes a template for rendering to HTML Tufte. */
export class HtmlTufteTemplate implements Template {
    /**
     * Initializes a new instance of this class.
     * @param options The options for customizing the template.
     */
    constructor(
        private options: HtmlTufteTemplateOptions
    ) {
    }

    /** @inheritdoc */
    public writeRoot(content: string, docInfo: DocumentInfo): string {
        const resMan = new ResourceManager({ path: this.options.outputPsth });
        resMan.serveMathjax();

        return HtmlTufteTemplate.getPageTemplate(content, docInfo);
    }

    /** @inheritdoc */
    public writeHeading(text: string, level: number): string {
        const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
        if (level <= 0 || level > levels.length) {
            throw new Error(`Invalid level '${level}'. Allowed is 1..${levels.length}`);
        }

        const tagname = levels[Math.min(level - 1, levels.length)];
        return [
            `<${tagname}>`,
            text,
            `</${tagname}>`,
        ].join("");
    }

    /** @inheritdoc */
    public writeParagraph(content: string): string {
        return `<p>${content}</p>`;
    }

    /** @inheritdoc */
    public writeParagraphText(text: string): string {
        return text;
    }

    /** @inheritdoc */
    public writeParagraphBoldText(text: string): string {
        return `<strong>${text}</strong>`;
    }

    /** @inheritdoc */
    public writeParagraphItalicText(text: string): string {
        return `<em>${text}</em>`;
    }

    /** @inheritdoc */
    public writeParagraphCodeInline(src: string, evalResult?: string): string {
        if (evalResult) {
            return [
                `<code title="Evaluated from: '${src}'">`,
                evalResult,
                `</code>`,
            ].join("");
        }

        return [
            `<code>`,
            src,
            `</code>`,
        ].join("");
    }

    /** @inheritdoc */
    public writeCodeblock(src: string, evalResult?: string): string {
        return [
            "<pre>",
            "<code>",
            src,
            `</code>`,
            `</pre>`,
            evalResult ? "<pre>" : "",
            evalResult ? "<code>" : "",
            evalResult ? evalResult : "",
            evalResult ? `</code>` : "",
            evalResult ? `</pre>` : "",
        ].join("");
    }

    private static getPageTemplate(content: string, docInfo: DocumentInfo): string {
        return [
            "<html lang='en'>",
            "<head>",
            "<meta charset='utf-8'/>",
            `<title>${docInfo.title || ""}</title>`,
            "<style>",
            HtmlTufteTemplate.getLatexCss(),
            "</style>",
            "<style>",
            HtmlTufteTemplate.getTufteCss(),
            "</style>",
            "<script id='MathJax-script' async src='__res/mathjax/tex-chtml.js'></script>",
            "<meta name='viewport' content='width=device-width, initial-scale=1'>",
            "</head>",
            "<body>",
            "<article>",
            content,
            "</article>",
            "</body>",
        ].join("");
    }

    private static getLatexCss(): string {
        return HtmlTufteTemplate.getFile(resolve(__dirname, "res", "html_tufte", "latex.css"));
    }

    private static getTufteCss(): string {
        return HtmlTufteTemplate.getFile(resolve(__dirname, "res", "html_tufte", "tufte.css"));
    }

    private static getFile(path: string): string {
        if (!existsSync(path)) {
            throw new Error(`Cannot get 'latex.css', path '${path}' does not exist`);
        }

        return readFileSync(path).toString();
    }
}
