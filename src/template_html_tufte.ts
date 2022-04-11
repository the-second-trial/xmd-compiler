import { resolve } from "path";
import { existsSync, readFileSync } from "fs";

import { Constants } from "./constants";
import { Template } from "./template";

/** Describes a template for rendering to HTML Tufte. */
export class HtmlTufteTemplate implements Template {
    /** @inheritdoc */
    public writeRoot(content: string): string {
        return HtmlTufteTemplate.getPageTemplate(content);
    }

    /** @inheritdoc */
    public writeHeading(text: string, level: number): string {
        const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
        const tagname = levels[Math.min(level + 1, levels.length)];
        return [
            `<${tagname}>`,
            text,
            `</${tagname}>`,
        ].join("");
    }

    /** @inheritdoc */
    public writeParagraph(elements: any[]): string {
        const inlineElementRenderers = {
            [Constants.NodeTypes.PAR_TEXT]: (v: string) => v,
            [Constants.NodeTypes.PAR_ITALIC]: (v: string) => `<em>${v}</em>`,
            [Constants.NodeTypes.PAR_BOLD]: (v: string) => `<strong>${v}</strong>`,
            [Constants.NodeTypes.PAR_CODEINLINE]: (v: string) => `<code>${v}</code>`,
        };
    
        const content = elements
            .map(inlineElement => {
                const inlineRenderer = inlineElementRenderers[inlineElement.t];
                if (!inlineRenderer) {
                    throw new Error(`Unrecognized par element type '${inlineElement.t}'`);
                }
                return inlineRenderer(inlineElement.v);
            })
            .join("");
        
            return `<p>${content}</p>`;
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

    private static getPageTemplate(content: string): string {
        return [
            "<html lang='en'>",
            "<head>",
            "<meta charset='utf-8'/>",
            "<title>Tufte CSS</title>",
            "<style>",
            HtmlTufteTemplate.getLatexCss(),
            "</style>",
            "<style>",
            HtmlTufteTemplate.getTufteCss(),
            "</style>",
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
