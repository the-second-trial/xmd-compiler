import { AstBaseNode, AstRootNode } from "./ast";

/** Describes a component capable of transforming an AST. */
export interface AstTransformer<TOut extends AstBaseNode> {
    /**
     * Returns a different AST from an input one.
     * @param ast The input AST.
     * @returns The transformed AST.
     */
    transform(ast: AstRootNode): TOut;
}
