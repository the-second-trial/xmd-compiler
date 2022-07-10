import { AstRootNode } from "../../ast";
import { CodeChunkEvaluator } from "../../code_srv";
import { DirectivesController } from "../../directives";
import { AuthorHelper } from "../../helpers/author_helper";
import { ResourceImage } from "../../resource_image";
import { DocumentInfo } from "../../semantics";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { TexDocAstTransformer } from "./ast_transformer_tex_doc";
import { TexDocImportedRenderer, TexDocRenderer } from "./renderer_tex_doc";

/** The generic generator for LaTeX document (article) generator. */
export class TexDocGenerator extends DirectFlowGenerator {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     * @param inputImage The output image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
     constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexDocRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected transformAst(ast: AstRootNode): AstRootNode {
        const initiallyTransformedAst = super.transformAst(ast);

        const transformer = new TexDocAstTransformer();
        return transformer.transform(initiallyTransformedAst);
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            this.inputImage,
            new TexDocImportedGenerator(this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }

    /** @inheritdoc */
    protected extractSemanticInfo(node: AstRootNode): DocumentInfo {
        const docInfo = super.extractSemanticInfo(node);

        // Author
        const author = new AuthorHelper(node).getAuthor();
        if (author) {
            docInfo.author = author;
        }

        return docInfo;
    }
}

class TexDocImportedGenerator extends DirectFlowGenerator {
     constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexDocImportedRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            this.inputImage,
            new TexDocImportedGenerator(this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }
}
