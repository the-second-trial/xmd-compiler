const { EOL } = require("os");

import { ResourceImage } from "../../../resource_image";
import { DocumentInfo } from "../../../semantics";
import { idgen } from "../../../utils";
import { TexRenderer } from "../../tex/renderer_tex";

/** Describes a template for rendering to Tex Tufte. */
export class TexTufteRenderer extends TexRenderer {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     */
    constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage
    ) {
        super(
            outputImage,
            inputImage,
            idgen("ref")
        );
    }

    /** @inheritdoc */
    public writeRoot(content: string, docInfo: DocumentInfo): string {
        this.resMan.serveTexTufteTemplateFiles();

        return this.getPageTemplate(content, docInfo);
    }

    /** @inheritdoc */
    public writeCodeblock(src: string, evalResult?: string, outputType?: string): string {
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
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     */
    constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage
    ) {
        super(outputImage, inputImage);
    }

    protected getPageTemplate(
        content: string,
        docInfo: DocumentInfo
    ): string {
        return content;
    }
}
