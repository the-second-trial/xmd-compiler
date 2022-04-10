import { Constants } from "./constants";
import { Template } from "./template";

/** Describes a template for rendering to HTML Tufte. */
export class HtmlTufteTemplate implements Template {
    /** @inheritdoc */
    public writeRoot(content: string): string {
        return [
            "<body>",
            "<article>",
            content,
            "</article>",
            "</body>",
        ].join("");
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
}
