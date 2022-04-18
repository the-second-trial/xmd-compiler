import { XmdAst } from "./ast";

/** Describes a component capable of transforming an AST. */
export interface AstTransformer<TOut> {
    /**
     * Returns a different AST from an input one.
     * @param ast The input AST.
     * @returns The transformed AST.
     */
    transform(ast: XmdAst): TOut;
}
