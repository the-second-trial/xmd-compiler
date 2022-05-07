import { dirname } from "path";

import { AstBaseNode, XmdAst } from "../ast";
import { CodeChunkEvaluator } from "../code_srv";
import { Constants } from "../constants";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { MathEnvironmentsRenderer } from "../extensions/renderer_math_environ";
import { TheoremEnvironAstComponentNode } from "../generic/ast_environ";
import { EnvironmentAstTransformer } from "../generic/ast_environ_transformer";
import { TexMathEnvironmentsRenderer } from "./renderer_math_environ_tex";
import { TexTufteRenderer } from "./renderer_tex_tufte";

/** A component capable of rendering the final code. */
export class TexTufteGenerator extends DirectFlowGenerator {
    private mathEnvironRenderer: MathEnvironmentsRenderer;

    /**
     * Initializes a new instance of this class.
     * @param outputDir The path to the location where the output directory will be created.
     * @param srcPath The path to the input source file.
     * @param codeEvaluator The Python code chunk evaluator.
     */
     constructor(
        outputDir: string,
        srcPath: string,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new TexTufteRenderer({
                outputPath: outputDir,
                inputPath: srcPath,
            }),
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
    protected transformAst(ast: XmdAst): { v: Array<AstBaseNode> } {
        const transformer = new EnvironmentAstTransformer();
        return transformer.transform(ast);
    }

    private generateTheoremEnviron(node: TheoremEnvironAstComponentNode): string {
        return this.mathEnvironRenderer.writeTheorem(node.v.title, node.v.statement, node.v.proof);
    }
}
