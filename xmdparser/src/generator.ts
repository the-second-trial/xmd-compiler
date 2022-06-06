import { XmdAst } from "./ast";
import { OutputImage } from "./output_image";

/** Describes a generator. */
export interface Generator {
    /**
     * Generates the output code.
     * @param ast The input AST.
     */
    generate(ast: XmdAst): Promise<string>;

    /**
     * Writes the output to file
     * @param output The output code to write to file.
     * @returns The path where the file has been saved.
     */
    write(output: string): string;

    /** Gets the output image. */
    output: OutputImage;
}
