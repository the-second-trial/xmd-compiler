import { CodeChunkEvaluator } from "../code_srv";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { TexTufteRenderer } from "./renderer_tex_tufte";

/** A component capable of rendering the final code. */
export class TexTufteGenerator extends DirectFlowGenerator {
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
    }
}
