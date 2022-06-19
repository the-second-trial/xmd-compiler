import { AstRootNode } from "../../ast";
import { CodeChunkEvaluator } from "../../code_srv";
import { AbstractHelper } from "../../helpers/abstract_helper";
import { AuthorHelper } from "../../helpers/author_helper";
import { ResourceImage } from "../../resource_image";
import { DocumentInfo } from "../../semantics";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { DirectFlowRenderer } from "../direct_flow_renderer";
import { TufteAstTransformer } from "./ast_transformer_tufte";

/** The generic generator for all Tufte generators. */
export class TufteGenerator extends DirectFlowGenerator {
    /**
     * Initializes a new instance of this class.
     * @param renderer The renderer to use.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        renderer: DirectFlowRenderer,
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(renderer, outputImage, inputImage, codeEvaluator);
    }

    /** @inheritdoc */
    protected transformAst(ast: AstRootNode): AstRootNode {
        const initiallyTransformedAst = super.transformAst(ast);

        const transformer = new TufteAstTransformer();
        return transformer.transform(initiallyTransformedAst);
    }

    /** @inheritdoc */
    protected extractSemanticInfo(node: AstRootNode): DocumentInfo {
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
