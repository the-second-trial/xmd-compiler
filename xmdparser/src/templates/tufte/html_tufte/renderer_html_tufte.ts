import { DirectFlowRenderer } from "../../direct_flow_renderer";
import { ImageExtensionAttributes } from "../../../extensions/extensions";
import { TemplateResourceManager } from "../../template_res_manager";
import { DocumentInfo } from "../../../semantics";
import { idgen } from "../../../utils";
import { ensureVPathSyntax, ResourceImage } from "../../../resource_image";
import { ExternalResourceManager } from "../../external_res_manager";

// TODO: Handle sections.
/** Describes a template for rendering to HTML Tufte. */
export class HtmlTufteRenderer implements DirectFlowRenderer {
    private refIdGen: Generator<string>;
    private resMan: TemplateResourceManager;
    private extResMan: ExternalResourceManager;

    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     */
    constructor(
        private outputImage: ResourceImage,
        private inputImage: ResourceImage
    ) {
        this.refIdGen = idgen("ref");
        this.resMan = new TemplateResourceManager(outputImage);
        this.extResMan = new ExternalResourceManager(inputImage, outputImage);
    }

    /** @inheritdoc */
    public writeOutput(output: string): string {
        const outputFileName = "index.html";
        const vpath = `/${outputFileName}`;
        this.outputImage.addString(output, vpath);

        return vpath;
    }

    /** @inheritdoc */
    public writeRoot(content: string, docInfo: DocumentInfo): string {
        const paths = {
            tufteCss: this.resMan.serveTufteCss(),
            latexCss: this.resMan.serveLatexCss(),
            // TODO: Optimization, do not serve mathjax if no equation is found in AST
            mathjaxJs: this.resMan.serveMathjax(),
        };

        return this.getPageTemplate(content, paths, docInfo);
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
    public writeCodeblock(src: string, evalResult?: string, outputType?: string): string {
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

    /** @inheritdoc */
    public writeEquationblock(equation: string): string {
        return [
            "<p>",
            "\\[",
            equation,
            "\\]",
            "</p>",
        ].join("");
    }

    /** @inheritdoc */
    public writeImage(
        alt: string,
        path: string,
        title?: string,
        ext?: ImageExtensionAttributes
    ): string {
        const immPath = this.extResMan.serveImage(ensureVPathSyntax(path));
        
        if (ext.fullwidth === "true") {
            return [
                "<figure class='fullwidth'>",
                `<img src="${immPath}" alt="${alt}" />`,
                "</figure>",
            ].join("");
        }

        const ref = this.refIdGen.next().value as string;
        return [
            "<figure>",
            `<label for="${ref}" class="margin-toggle">&#8853;</label>`,
            `<input type="checkbox" id="${ref}" class="margin-toggle"/>`,
            `<span class="marginnote">${title || alt}</span>`,
            `<img src="${immPath}" alt="${alt}" />`,
            "</figure>",
        ].join("");
    }

    /** @inheritdoc */
    public writeHRule(): string {
        return "<!--HRULE-->";
    }

    /**
     * Renders the enclosing structure of the page.
     * @param content 
     * @param paths 
     * @param docInfo 
     * @returns The rendered enclosing structure
     */
    protected getPageTemplate(
        content: string,
        paths: {
            mathjaxJs: string,
            tufteCss: string,
            latexCss: string
        },
        docInfo: DocumentInfo
    ): string {
        const langAttribute = docInfo.language ? ` lang="${docInfo.language}"` : "";
        const hasTitle = docInfo.title && docInfo.title.length > 0;
        const hasAuthor = docInfo.author && docInfo.author.length > 0;
        const hasAbstract = docInfo.abstract && docInfo.abstract.length > 0;

        return [
            "<!DOCTYPE html>",
            `<html${langAttribute}>`,
            "<head>",
            "<meta charset='utf-8'/>",
            `<title>${docInfo.title || "Untitled"}</title>`,
            `<link rel='stylesheet' href='${paths.latexCss}'>`,
            `<link rel='stylesheet' href='${paths.tufteCss}'>`,
            `<script id='MathJax-script' async src='${paths.mathjaxJs}/tex-chtml.js'></script>`,
            "<meta name='viewport' content='width=device-width, initial-scale=1'>",
            "</head>",
            "<body>",
            "<article>",
            hasTitle ? "<h1>" : "",
            docInfo.title || "",
            hasTitle ? "</h1>" : "",
            hasAuthor ? "<p class='subtitle'>" : "",
            docInfo.author || "",
            hasAuthor ? "</p>" : "",
            hasAbstract ? "<h2>Abstract</h2>" : "",
            hasAbstract ? "<p>" : "",
            docInfo.abstract || "",
            hasAbstract ? "</p>" : "",
            content,
            "</article>",
            "</body>",
            "</html>",
        ].join("");
    }
}

/** Describes a template for rendering to HTML Tufte (imported files). */
export class HtmlTufteImportedRenderer extends HtmlTufteRenderer {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     */
    constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage
    ) {
        super(outputImage, inputImage);
    }

    /** @inheritdoc */
    public writeOutput(output: string): string {
        // For imported, no need to add anything to the output image
        return "";
    }

    /** @inheritdoc */
    public writeRoot(content: string, docInfo: DocumentInfo): string {
        const paths = {
            tufteCss: "",
            latexCss: "",
            mathjaxJs: "",
        };

        return this.getPageTemplate(content, paths, docInfo);
    }

    /** @inheritdoc */
    protected getPageTemplate(
        content: string,
        paths: {
            mathjaxJs: string,
            tufteCss: string,
            latexCss: string
        },
        docInfo: DocumentInfo
    ): string {
        return content;
    }
}
