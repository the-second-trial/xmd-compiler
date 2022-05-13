import { dirname } from "path";

import { AstRootNode } from "../../ast";
import { CodeChunkEvaluator } from "../../code_srv";
import { DirectivesController } from "../../directives";
import { AuthorHelper } from "../../helpers/author_helper";
import { DocumentInfo } from "../../semantics";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { TexDocAstTransformer } from "./ast_transformer_tex_doc";
import { TexDocImportedRenderer, TexDocRenderer } from "./renderer_tex_doc";

/** The generic generator for LaTeX document (article) generator. */
export class TexDocGenerator extends DirectFlowGenerator {
    /**
     * Initializes a new instance of this class.
     * @param outputDir The path to the location where the output directory will be created.
     * @param srcPath The path to the input source file.
     * @param codeEvaluator The Python code chunk evaluator.
     */
     constructor(
        private outputDir: string,
        private srcPath: string,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexDocRenderer({
                outputPath: outputDir,
                inputPath: srcPath,
            }),
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
            new TexDocImportedGenerator(this.outputDir, this.srcPath, this.codeEvaluator)
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
        outputDir: string,
        srcPath: string,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexDocImportedRenderer({
                outputPath: outputDir,
                inputPath: srcPath,
            }),
            codeEvaluator
        );
    }
}
