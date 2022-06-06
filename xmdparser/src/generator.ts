import { XmdAst } from "./ast";
import { OutputImage } from "./output_image";

/** Describes a generator. */
export interface Generator {
    /**
     * Generates the output code.
     * @param ast The input AST.
     */
    generate(ast: XmdAst): Promise<string>;

    /** Gets the output image. */
    output: OutputImage;
}
