import { dirname } from "path";

import { CodeChunkEvaluator } from "../code_srv";
import { DirectivesController } from "../directives";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { HtmlTufteImportedRenderer, HtmlTufteRenderer } from "./renderer_html_tufte";

/** A component capable of rendering the final code. */
export class HtmlTufteGenerator extends DirectFlowGenerator {
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
            new HtmlTufteRenderer({
                outputPath: outputDir,
                inputPath: srcPath,
            }),
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new HtmlTufteImportedGenerator(this.outputDir, this.srcPath, this.codeEvaluator)
        );
    }
}

class HtmlTufteImportedGenerator extends DirectFlowGenerator {
    constructor(
        private outputDir: string,
        private srcPath: string,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlTufteImportedRenderer({
                outputPath: outputDir,
                inputPath: srcPath,
            }),
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new HtmlTufteImportedGenerator(this.outputDir, this.srcPath, this.codeEvaluator)
        );
    }
}
