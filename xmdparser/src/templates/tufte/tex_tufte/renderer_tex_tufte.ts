const { EOL } = require("os");

import { DirectFlowRenderer } from "../../direct_flow_renderer";
import { ImageExtensionAttributes } from "../../../extensions/extensions";
import { ResourceManager } from "../../../res_manager";
import { DocumentInfo } from "../../../semantics";
import { idgen } from "../../../utils";

export interface TexTufteTemplateOptions {
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

/** Describes a template for rendering to Tex Tufte. */
export class TexTufteRenderer implements DirectFlowRenderer {
    private refIdGen: Generator<string>;
    private resMan: ResourceManager;

    /**
     * Initializes a new instance of this class.
     * @param options The options for customizing the template.
     */
    constructor(
        private options: TexTufteTemplateOptions
    ) {
        this.refIdGen = idgen("ref");
        this.resMan = new ResourceManager({
            outputLocDir: this.options.outputPath,
            srcPath: this.options.inputPath,
            outputFileName: "main.tex",
            outputName: "textufte",
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
        this.resMan.serveTexTufteTemplateFiles();

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
        const hasAbstract = docInfo.abstract && docInfo.abstract.length > 0;

        return [
            "\\documentclass{tufte-handout}",
            `\\title{${docInfo.title || "Untitled"}}`,
            hasAuthor ? `\\author[${docInfo.author}]{${docInfo.author}}` : "",
            "\\usepackage{graphicx} % allow embedded images",
            "\\setkeys{Gin}{width=\\linewidth,totalheight=\\textheight,keepaspectratio}",
            "\\graphicspath{{graphics/}} % set of paths to search for images",
            "\\usepackage{amsmath} % extended mathematics",
            "\\usepackage{booktabs} % book-quality tables",
            "\\usepackage{units} % non-stacked fractions and better unit spacing",
            "\\usepackage{multicol} % multiple column layout facilities",
            "\\usepackage{fancyvrb} % extended verbatim environments",
            "\\fvset{fontsize=\\normalsize} % default font size for fancy-verbatim environments",
            "\\newcommand{\\doccmd}[1]{\\texttt{\\textbackslash#1}}% command name -- adds backslash automatically",
            "\\newcommand{\\docopt}[1]{\\ensuremath{\\langle}\\textrm{\\textit{#1}}\\ensuremath{\\rangle}}% optional command argument",
            "\\newcommand{\\docarg}[1]{\\textrm{\\textit{#1}}}% (required) command argument",
            "\\newcommand{\\docenv}[1]{\\textsf{#1}}% environment name",
            "\\newcommand{\\docpkg}[1]{\\texttt{#1}}% package name",
            "\\newcommand{\\doccls}[1]{\\texttt{#1}}% document class name",
            "\\newcommand{\\docclsopt}[1]{\\texttt{#1}}% document class option name",
            "\\newenvironment{docspec}{\\begin{quote}\\noindent}{\\end{quote}}% command specification environment",
            "\\begin{document}",
            "\\maketitle% this prints the handout title, author, and date",
            hasAbstract ? "\\begin{abstract}" : "",
            hasAbstract ? "\\noindent" : "",
            hasAbstract ? docInfo.abstract : "",
            hasAbstract ? "\\end{abstract}" : "",
            content,
            "\\bibliography{sample-handout}",
            "\\bibliographystyle{plainnat}",
            "\\end{document}",
        ].join(EOL);
    }
}

/** Describes a template for rendering to Tex Tufte (imported files). */
export class TexTufteImportedRenderer extends TexTufteRenderer {
    /**
     * Initializes a new instance of this class.
     * @param options The options for customizing the template.
     */
    constructor(
        options: TexTufteTemplateOptions
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
