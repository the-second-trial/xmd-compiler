import { AstBaseNode } from "../../ast";
import { CodeChunkEvaluator } from "../../code_srv";
import { AbstractHelper } from "../../helpers/abstract_helper";
import { AuthorHelper } from "../../helpers/author_helper";
import { DocumentInfo } from "../../semantics";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { DirectFlowRenderer } from "../direct_flow_renderer";

/** The generic generator for all Tufte generators. */
export class TufteGenerator extends DirectFlowGenerator {
    /**
     * Initializes a new instance of this class.
     * @param renderer The renderer to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        renderer: DirectFlowRenderer,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(renderer, codeEvaluator);
    }

    /** @inheritdoc */
    protected extractSemanticInfo(node: { v: Array<AstBaseNode> }): DocumentInfo {
        const docInfo = super.extractSemanticInfo(node);

        // Author
        const author = new AuthorHelper(node).getAuthor();
        if (author) {
            docInfo.author = author;
        }

        // Abstract
        const abstract = new AbstractHelper(node).getAbstract().join("");
        if (abstract) {
            docInfo.abstract = abstract;
        }

        return docInfo;
    }
}
