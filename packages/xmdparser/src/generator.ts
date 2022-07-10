import { XmdAst } from "./ast";
import { ResourceImage } from "./resource_image";

/** Describes a generator. */
export interface Generator {
    /**
     * Generates the output code.
     * @param ast The input AST.
     */
    generate(ast: XmdAst): Promise<string>;

    /** Gets the output image. */
    output: ResourceImage;
}
