const { EOL } = require("os");

const CODEBLOCK_STYLE_OUTPUT_FORMAT_LATEX_NAME = "latex";

export interface CodeBlockStylist {
    /**
     * Properly renders a codeblock.
     * @param src The input source.
     * @param output The result.
     */
    style(src: string, output?: string): string;
}

/**
 * A stylist for LaTeX documents.
 */
export class TexCodeBlockStylist implements CodeBlockStylist {
    constructor(
        private outputFormat: string
    ) {
    }

    /** @inheritdoc */
    public style(src: string, output?: string): string {
        switch (this.outputFormat) {
            case CODEBLOCK_STYLE_OUTPUT_FORMAT_LATEX_NAME:
                return this.styleLatex(src, output);
            default:
                return this.styleDefault(src, output);
        }
    }

    private styleLatex(src: string, output?: string): string {
        return [
            "\\begin{mdframed}[backgroundcolor=codebackcolor]",
            "\\begin{lstlisting}",
            src,
            `\\end{lstlisting}`,
            output ? "\\begin{mdframed}[rightline=false,leftline=false,bottomline=false]" : "",
            output ? "\\begin{equation*}" : "",
            output ? output : "",
            output ? `\\end{equation*}` : "",
            output ? "\\end{mdframed}" : "",
            "\\end{mdframed}",
        ].join(EOL) + EOL;
    }

    private styleDefault(src: string, output?: string): string {
        return [
            "\\begin{mdframed}[backgroundcolor=codebackcolor]",
            "\\begin{lstlisting}",
            src,
            `\\end{lstlisting}`,
            output ? "\\begin{mdframed}[rightline=false,leftline=false,bottomline=false]" : "",
            output ? "\\begin{lstlisting}[frame=none]" : "",
            output ? output : "",
            output ? `\\end{lstlisting}` : "",
            output ? "\\end{mdframed}" : "",
            "\\end{mdframed}",
        ].join(EOL) + EOL;
    }
}
