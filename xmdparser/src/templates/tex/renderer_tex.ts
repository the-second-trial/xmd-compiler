const { EOL } = require("os");

import { DirectFlowRenderer } from "../direct_flow_renderer";
import { ImageExtensionAttributes } from "../../extensions/extensions";
import { ResourceManager } from "../../res_manager";
import { DocumentInfo } from "../../semantics";
import { OutputImage } from "../../output_image";

/** Describes a template for rendering to Tex. */
export abstract class TexRenderer implements DirectFlowRenderer {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     * @param refIdGen The reference id generator.
     * @param resMan The resource manager.
     */
    constructor(
        protected outputImage: OutputImage,
        protected refIdGen: Generator<string>,
        protected resMan: ResourceManager
    ) {
    }

    /** @inheritdoc */
    public writeOutput(output: string): string {
        const outputFileName = "main.tex";
        const vpath = `/${outputFileName}`;
        this.outputImage.addString(output, vpath);

        return vpath;
    }

    /** @inheritdoc */
    public abstract writeRoot(content: string, docInfo: DocumentInfo): string;

    /** @inheritdoc */
    public writeHeading(text: string, level: number): string {
        // The title is handled separately, hence '#' and '##' should both get '\section'
        const levels = ["section", "section", "subsection", "subsubsection", "paragraph"];
        if (level <= 0 || level > levels.length) {
            throw new Error(`Invalid level '${level}'. Allowed is 1..${levels.length}`);
        }

        const envname = levels[Math.min(level - 1, levels.length)];
        return `\\${envname}{${text}}` + EOL;
    }

    /** @inheritdoc */
    public writeParagraph(content: string): string {
        return content + EOL;
    }

    /** @inheritdoc */
    public writeParagraphText(text: string): string {
        return text;
    }

    /** @inheritdoc */
    public writeParagraphBoldText(text: string): string {
        return `\\textbf{${text}}`;
    }

    /** @inheritdoc */
    public writeParagraphItalicText(text: string): string {
        return `\\textit{${text}}`;
    }

    /** @inheritdoc */
    public writeParagraphEquationInlineText(equation: string): string {
        return `$${equation}$`;
    }

    /** @inheritdoc */
    public writeParagraphCodeInline(src: string, evalResult?: string): string {
        if (evalResult) {
            return `\\Verb|${evalResult}|`;
        }

        return `\\Verb|${src}|`;
    }

    /** @inheritdoc */
    public writeCodeblock(src: string, evalResult?: string, outputType?: string): string {
        return [
            "\\begin{quote}",
            src,
            `\\end{quote}`,
            evalResult ? "Result:" : "",
            evalResult ? "\\begin{quote}" : "",
            evalResult ? evalResult : "",
            evalResult ? `\\end{quote}` : "",
        ].join(EOL) + EOL;
    }

    /** @inheritdoc */
    public writeEquationblock(equation: string): string {
        return [
            "\\begin{equation*}",
            equation,
            "\\end{equation*}",
        ].join(EOL) + EOL;
    }

    /** @inheritdoc */
    public writeImage(alt: string, path: string, title?: string, ext?: ImageExtensionAttributes): string {
        const immPath = this.resMan.serveImage(path); // Auto name
        const ref = this.refIdGen.next().value as string;
        
        if (ext.fullwidth === "true") {
            return [
                "\\begin{figure*}[h]",
                `\\includegraphics{${immPath}}`,
                `\\caption{${title}}`,
                `\\label{${ref}}`,
                "\\end{figure*}",
            ].join(EOL) + EOL;
        }

        return [
            "\\begin{figure}",
            `\\includegraphics{${immPath}}`,
            `\\caption{${title}}`,
            `\\label{${ref}}`,
            "\\setfloatalignment{b}",
            "\\end{figure}",
        ].join(EOL) + EOL;
    }

    /** @inheritdoc */
    public writeHRule(): string {
        return `${EOL}%HRULE${EOL}`;
    }
}
