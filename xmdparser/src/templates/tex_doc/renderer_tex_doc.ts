const { EOL } = require("os");

import { ResourceManager } from "../../res_manager";
import { DocumentInfo } from "../../semantics";
import { idgen } from "../../utils";
import { TexRenderingOptions } from "../tex/renderer_options_tex";
import { TexRenderer } from "../tex/renderer_tex";

export interface TexDocRenderingOptions extends TexRenderingOptions {}

/** Describes a template for rendering to Tex Doc. */
export class TexDocRenderer extends TexRenderer {
    /**
     * Initializes a new instance of this class.
     * @param options The options for customizing the template.
     */
    constructor(
        options: TexDocRenderingOptions
    ) {
        super(
            options,
            idgen("ref"),
            new ResourceManager({
                outputLocDir: options.outputPath,
                srcPath: options.inputPath,
                outputFileName: "main.tex",
                outputName: "texdoc",
            })
        );
    }

    /** @inheritdoc */
    public writeRoot(content: string, docInfo: DocumentInfo): string {
        return this.getPageTemplate(content, docInfo);
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
        options: TexDocRenderingOptions
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
