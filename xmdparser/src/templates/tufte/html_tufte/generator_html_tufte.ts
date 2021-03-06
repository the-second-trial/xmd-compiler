import { CodeChunkEvaluator } from "../../../code_srv";
import { DirectivesController } from "../../../directives";
import { ResourceImage } from "../../../resource_image";
import { DirectFlowGenerator } from "../../direct_flow_generator";
import { TufteGenerator } from "../generator_tufte";
import { HtmlTufteImportedRenderer, HtmlTufteRenderer } from "./renderer_html_tufte";

/** A component capable of rendering the final code. */
export class HtmlTufteGenerator extends TufteGenerator {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlTufteRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            this.inputImage,
            new HtmlTufteImportedGenerator(this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }
}

class HtmlTufteImportedGenerator extends DirectFlowGenerator {
    constructor(
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlTufteImportedRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            this.inputImage,
            new HtmlTufteImportedGenerator(this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }
}
