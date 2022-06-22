const { EOL } = require("os");

import { ImageExtensionAttributes } from "../../extensions/extensions";
import { TexCodeBlockStylist } from "../../generic/code_block_style";
import { ensureVPathSyntax, ResourceImage } from "../../resource_image";
import { DocumentInfo } from "../../semantics";
import { idgen } from "../../utils";
import { TexRenderer } from "../tex/renderer_tex";

/** Describes a template for rendering to Tex Doc. */
export class TexDocRenderer extends TexRenderer {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image.
     * @param inputImage The input image.
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
        return this.getPageTemplate(content, docInfo);
    }

    /** @inheritdoc */
    public writeCodeblock(src: string, evalResult?: string, outputType?: string): string {
        return new TexCodeBlockStylist(outputType).style(src, evalResult);
    }

    /** @inheritdoc */
    public writeImage(alt: string, path: string, title?: string, ext?: ImageExtensionAttributes): string {
        const immPath = this.extResMan.serveImage(ensureVPathSyntax(path));
        const ref = this.refIdGen.next().value as string;
        
        return [
            "\\begin{figure}",
            `\\includegraphics{${immPath}}`,
            `\\caption{${title}}`,
            `\\label{${ref}}`,
            "\\end{figure}",
        ].join(EOL) + EOL;
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
            "\\usepackage{mdframed} % intelligent frames",
            "\\usepackage{graphicx} % allow embedded images",
            "\\usepackage{sidecap}",
            "\\usepackage{listings} % better code snippets",
            "\\usepackage{xcolor} % for defining colors",
            "% defining custom envs for theorems",
            "\\newtheorem{prop}{Proposition}",
            "\\newtheorem{lemma}{Lemma}",
            "\\definecolor{codebackcolor}{HTML}{EFEFEF}",
            "\\lstdefinestyle{codestyle}{",
            "basicstyle=\\ttfamily\\footnotesize,",
            "breakatwhitespace=false,",
            "breaklines=true,",
            "captionpos=b,",
            "keepspaces=true,",
            "showspaces=false,",
            "showstringspaces=false,",
            "showtabs=false,",
            "tabsize=2",
            "}",
            "\\lstset{style=codestyle}",
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
     * @param outputImage The output image.
     * @param inputImage The input image.
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
