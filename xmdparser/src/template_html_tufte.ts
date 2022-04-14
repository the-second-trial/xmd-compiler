import { DocumentInfo, Template } from "./template";
import { ResourceManager } from "./res_manager";

export interface HtmlTufteTemplateOptions {
    outputPath: string;
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
        const resMan = new ResourceManager({ path: this.options.outputPath });
        const paths = {
            tufteCss: resMan.serveTufteCss(),
            latexCss: resMan.serveLatexCss(),
            // TODO: Optimization, do not serve mathjax if no equation is found in AST
            mathjaxJs: resMan.serveMathjax()
        };

        return HtmlTufteTemplate.getPageTemplate(content, paths, docInfo);
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
    public writeParagraphEquationInlineText(equation: string): string {
        return `\\(${equation}\\)`;
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

    private static getPageTemplate(
        content: string,
        paths: {
            mathjaxJs: string,
            tufteCss: string,
            latexCss: string
        },
        docInfo: DocumentInfo
    ): string {
        return [
            "<html lang='en'>",
            "<head>",
            "<meta charset='utf-8'/>",
            `<title>${docInfo.title || ""}</title>`,
            `<link rel='stylesheet' href='${paths.latexCss}'>`,
            `<link rel='stylesheet' href='${paths.tufteCss}'>`,
            `<script id='MathJax-script' async src='${paths.mathjaxJs}/tex-chtml.js'></script>`,
            "<meta name='viewport' content='width=device-width, initial-scale=1'>",
            "</head>",
            "<body>",
            "<article>",
            content,
            "</article>",
            "</body>",
        ].join("");
    }
}
