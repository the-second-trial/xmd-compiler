import { dirname } from "path";

import { CodeChunkEvaluator } from "../../../code_srv";
import { DirectivesController } from "../../../directives";
import { OutputImage } from "../../../output_image";
import { DirectFlowGenerator } from "../../direct_flow_generator";
import { TufteGenerator } from "../generator_tufte";
import { HtmlTufteImportedRenderer, HtmlTufteRenderer } from "./renderer_html_tufte";

/** A component capable of rendering the final code. */
export class HtmlTufteGenerator extends TufteGenerator {
    /**
     * Initializes a new instance of this class.
     * @param srcPath The path to the input source file.
     * @param outputImage The output image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        private srcPath: string,
        outputImage: OutputImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlTufteRenderer(outputImage),
            outputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new HtmlTufteImportedGenerator(this.srcPath, this.outputImage, this.codeEvaluator)
        );
    }
}

class HtmlTufteImportedGenerator extends DirectFlowGenerator {
    constructor(
        private srcPath: string,
        outputImage: OutputImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlTufteImportedRenderer(outputImage),
            outputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new HtmlTufteImportedGenerator(this.srcPath, this.outputImage, this.codeEvaluator)
        );
    }
}
