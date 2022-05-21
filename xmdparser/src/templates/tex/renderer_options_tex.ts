import { RenderingOptions } from "../renderer";

/** Describes renderer options for all TeX based output formats. */
export interface TexRenderingOptions extends RenderingOptions {
    /** The path to executable pdflatex.exe to use for generating the PDF. */
    pathToPdfLatex?: string;
}
