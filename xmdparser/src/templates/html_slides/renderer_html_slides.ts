import { DirectFlowRenderer } from "../direct_flow_renderer";
import { ImageExtensionAttributes } from "../../extensions/extensions";
import { TemplateResourceManager } from "../template_res_manager";
import { DocumentInfo } from "../../semantics";
import { ResourceImage } from "../../resource_image";
import { ExternalResourceManager } from "../external_res_manager";
import { ensureVPathSyntax } from "../../resource_image";

/**
 * Describes a template for rendering to HTML Reveal JS slides.
 * In this context, the following rules apply:
 * - The first level-1 heading is picked up as the title of the presentation.
 * - Every level-2 heading defines a slide.
 */
export class HtmlSlidesRenderer implements DirectFlowRenderer {
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
        this.resMan = new TemplateResourceManager(outputImage);
        this.extResMan = new ExternalResourceManager(outputImage, inputImage);
    }

    /**
     * Renders a slide.
     * @param content 
     * @returns 
     */
    public writeSlide(content: string): string {
        return [
            "<section>",
            content,
            "</section>",
        ].join("");
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
            dist: this.resMan.serveRevealJsDistDir(),
            plugin: this.resMan.serveRevealJsPluginDir()
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
    public writeImage(alt: string, path: string, title?: string, ext?: ImageExtensionAttributes): string {
        const immPath = this.extResMan.serveImage(ensureVPathSyntax(path));
        
        return `<img src="${immPath}" alt="${alt}" />`;
    }

    /** @inheritdoc */
    public writeHRule(): string {
        // Should never get to this point as the generator absorbs all HRules
        throw new Error("Not implemented");
    }

    protected getPageTemplate(
        content: string,
        paths: {
            dist: string,
            plugin: string
        },
        docInfo: DocumentInfo
    ): string {
        const langAttribute = docInfo.language ? ` lang="${docInfo.language}"` : "";

        return [
            "<!DOCTYPE html>",
            `<html${langAttribute}>`,
            "<head>",
            "<meta charset='utf-8'/>",
            "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>",
            `<title>${docInfo.title || "Untitled"}</title>`,
            `<link rel="stylesheet" href="${paths.dist}/reset.css">`,
            `<link rel="stylesheet" href="${paths.dist}/reveal.css">`,
            `<link rel="stylesheet" href="${paths.dist}/theme/white.css">`,
            `<link rel="stylesheet" href="${paths.plugin}/highlight/monokai.css">`,
            "</head>",
            "<body>",
            `<div class="reveal">`,
            `<div class="slides">`,
            content,
            "</div>",
            "</div>",
            `<script src="${paths.dist}/reveal.js"></script>`,
            `<script src="${paths.plugin}/notes/notes.js"></script>`,
            `<script src="${paths.plugin}/highlight/highlight.js"></script>`,
            `<script src="${paths.plugin}/math/math.js"></script>`,
            `<script>`,
            "Reveal.initialize({hash: true, plugins: [ RevealHighlight, RevealNotes, RevealMath.MathJax3 ]});",
            `</script>`,
            "</body>",
            "</html>",
        ].join("");
    }
}

/** Describes a template for rendering to HTML Slides (imported files). */
export class HtmlSlidesImportedRenderer extends HtmlSlidesRenderer {
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
            dist: "",
            plugin: "",
        };
        
        return this.getPageTemplate(content, paths, docInfo);
    }

    protected getPageTemplate(
        content: string,
        paths: {
            dist: string,
            plugin: string
        },
        docInfo: DocumentInfo
    ): string {
        return content;
    }
}
