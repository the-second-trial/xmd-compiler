/** Describes renderer options for all output formats. */
export interface RenderingOptions {
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
