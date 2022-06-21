import { dirname } from "path";

import { AstBaseNode, AstRootNode } from "../../../ast";
import { CodeChunkEvaluator } from "../../../code_srv";
import { Constants } from "../../../constants";
import { DirectivesController } from "../../../directives";
import { DirectFlowGenerator } from "../../direct_flow_generator";
import { MathEnvironmentsRenderer } from "../../../extensions/renderer_math_environ";
import { TheoremEnvironAstComponentNode } from "../../../generic/ast_environ";
import { EnvironmentAstTransformer } from "../../../generic/ast_environ_transformer";
import { TexMathEnvironmentsRenderer } from "./renderer_math_environ_tex";
import { TexTufteImportedRenderer, TexTufteRenderer } from "./renderer_tex_tufte";
import { TufteGenerator } from "../generator_tufte";
import { ResourceImage } from "../../../resource_image";

/** A component capable of rendering the final code. */
export class TexTufteGenerator extends TufteGenerator {
    private mathEnvironRenderer: MathEnvironmentsRenderer;

    /**
     * Initializes a new instance of this class.
     * @param srcPath The path to the input source file.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     * @param pathToPdfLatex The path to pdfLatex for generating the PDF.
     */
    constructor(
        private srcPath: string,
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator,
        pathToPdfLatex?: string
    ) {
        super(
            new TexTufteRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );

        this.mathEnvironRenderer = new TexMathEnvironmentsRenderer();
    }

    /** @inheritdoc */
    protected async handleAstComponentNodeRendering(componentNode: AstBaseNode): Promise<string> {
        switch (componentNode.t) {
            case Constants.ExtendedNodeTypes.THEOREM:
                return this.generateTheoremEnviron(componentNode as TheoremEnvironAstComponentNode);
        }
        
        // Fall back to normal handling
        return super.handleAstComponentNodeRendering(componentNode);
    }

    /** @inheritdoc */
    protected transformAst(ast: AstRootNode): AstRootNode {
        const initiallyTransformedAst = super.transformAst(ast);

        const transformer = new EnvironmentAstTransformer();
        return transformer.transform(initiallyTransformedAst);
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new TexTufteImportedGenerator(this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }

    private generateTheoremEnviron(node: TheoremEnvironAstComponentNode): string {
        return this.mathEnvironRenderer.writeTheorem(node.v.title, node.v.statement, node.v.proof);
    }
}

class TexTufteImportedGenerator extends DirectFlowGenerator {
    private mathEnvironRenderer: MathEnvironmentsRenderer;

     constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexTufteImportedRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );

        this.mathEnvironRenderer = new TexMathEnvironmentsRenderer();
    }

    /** @inheritdoc */
    protected async handleAstComponentNodeRendering(componentNode: AstBaseNode): Promise<string> {
        switch (componentNode.t) {
            case Constants.ExtendedNodeTypes.THEOREM:
                return this.generateTheoremEnviron(componentNode as TheoremEnvironAstComponentNode);
        }
        
        // Fall back to normal handling
        return super.handleAstComponentNodeRendering(componentNode);
    }

    private generateTheoremEnviron(node: TheoremEnvironAstComponentNode): string {
        return this.mathEnvironRenderer.writeTheorem(node.v.title, node.v.statement, node.v.proof);
    }
}
