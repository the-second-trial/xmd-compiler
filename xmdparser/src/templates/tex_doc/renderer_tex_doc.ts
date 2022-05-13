const { EOL } = require("os");

import { DirectFlowRenderer } from "../direct_flow_renderer";
import { ImageExtensionAttributes } from "../../extensions/extensions";
import { ResourceManager } from "../../res_manager";
import { DocumentInfo } from "../../semantics";
import { idgen } from "../../utils";

export interface TexDocTemplateOptions {
    /** The path to the output directory location. */
    outputPath: string;
    /**
     * The path to the input file.
     * This is necessary to correctly resolve the file
     * references present in the input file.
     * All references in the input source are assumed
     * relative to that input source file.
     */
    inputPath: string;
}

/** Describes a template for rendering to Tex Doc. */
export class TexDocRenderer implements DirectFlowRenderer {
    private refIdGen: Generator<string>;
    private resMan: ResourceManager;

    /**
     * Initializes a new instance of this class.
     * @param options The options for customizing the template.
     */
    constructor(
        private options: TexDocTemplateOptions
    ) {
        this.refIdGen = idgen("ref");
        this.resMan = new ResourceManager({
            outputLocDir: this.options.outputPath,
            srcPath: this.options.inputPath,
            outputFileName: "main.tex",
            outputName: "texdoc",
        });
    }

    /** @inheritdoc */
    public get outputDirPath(): string {
        return this.resMan.outputDir;
    }

    /** @inheritdoc */
    public writeToFile(output: string): string {
        return this.resMan.writeToOutputFile(output);
    }

    /** @inheritdoc */
    public writeRoot(content: string, docInfo: DocumentInfo): string {
        return this.getPageTemplate(content, docInfo);
    }

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
    public writeCodeblock(src: string, evalResult?: string): string {
        return [
            "\\begin{docspec}",
            src,
            `\\end{docspec}`,
            evalResult ? "Result:" : "",
            evalResult ? "\\begin{docspec}" : "",
            evalResult ? evalResult : "",
            evalResult ? `\\end{docspec}` : "",
        ].join(EOL) + EOL;
    }

    /** @inheritdoc */
    public writeEquationblock(equation: string): string {
        return [
            "\\begin{equation}",
            equation,
            "\\end{equation}",
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

    protected getPageTemplate(
        content: string,
        docInfo: DocumentInfo
    ): string {
        const hasAuthor = docInfo.author && docInfo.author.length > 0;

        return [
            "\\documentclass{article}",
            "\\usepackage[utf8]{inputenc}",
            "\\usepackage{amsfonts}",
            "\\usepackage{amsmath} % extended mathematics",
            "\\usepackage{fancyvrb} % extended verbatim environments",
            "\\usepackage{amsthm} % theorems",
            "\\usepackage{graphicx} % allow embedded images",
            "\\usepackage{sidecap}",
            "\\usepackage{listings} % better code snippets",
            "% defining custom envs for theorems",
            "\\newtheorem{prop}{Proposition}",
            "\\newtheorem{lemma}{Lemma}",
            `\\title{${docInfo.title || "Untitled"}}`,
            hasAuthor ? `\\author{${docInfo.author}}` : "",
            "\\date{\\today}",
            "\\begin{document}",
            "\\maketitle",
            content,
            "%\\tableofcontents",
            "\\end{document}",
        ].join(EOL);
    }
}

/** Describes a template for rendering to Tex Doc (imported files). */
export class TexDocImportedRenderer extends TexDocRenderer {
    /**
     * Initializes a new instance of this class.
     * @param options The options for customizing the template.
     */
    constructor(
        options: TexDocTemplateOptions
    ) {
        super(options);
    }

    protected getPageTemplate(
        content: string,
        docInfo: DocumentInfo
    ): string {
        return content;
    }
}
