import { dirname } from "path";

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
     * @param srcPath The path to the input source file.
     * @param outputImage The output image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     * @param pathToPdfLatex The path to pdfLatex for generating the PDF.
     */
     constructor(
        private srcPath: string,
        outputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator,
        pathToPdfLatex?: string
    ) {
        super(
            new TexDocRenderer(outputImage),
            outputImage,
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
            dirname(this.srcPath),
            new TexDocImportedGenerator(this.outputImage, this.codeEvaluator)
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
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexDocImportedRenderer(outputImage),
            outputImage,
            codeEvaluator
        );
    }
}
