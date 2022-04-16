import { Constants } from "./constants";
import { Generator } from "./generator";
import { PythonCodeServer } from "./py_srv";
import { HtmlTufteTemplate } from "./template_html_tufte";
import { TexTufteTemplate } from "./template_tex_tufte";

/** Creates a properly configured generator. */
export class GeneratorFactory {
    /**
     * Initializes a new instance of this class.
     * @param outputType The type of output.
     * @param pysrv The Python server.
     * @param outputDir The path to the location where the output directory will be created.
     * @param srcPath The path to the input source file.
     */
    constructor(
        private outputType: string,
        private pysrv: PythonCodeServer,
        private outputDir: string,
        private srcPath: string
    ) {
    }

    /**
     * Creates the generator.
     * @returns A @see Generator.
     */
    public create(): Generator {
        if (this.outputType === Constants.OutputTypes.HTML_TUFTE) {
            return this.createForHtmlTufte();
        }

        if (this.outputType === Constants.OutputTypes.TEX_TUFTE) {
            return this.createForTexTufte();
        }

        throw new Error(`Cannot create generator, output type '${this.outputType}' not recognized`);
    }

    private createForHtmlTufte(): Generator {
        return new Generator(
            new HtmlTufteTemplate({
                outputPath: this.outputDir,
                inputPath: this.srcPath,
            }),
            this.pysrv
        )
    }

    private createForTexTufte(): Generator {
        return new Generator(
            new TexTufteTemplate({
                outputPath: this.outputDir,
                inputPath: this.srcPath,
            }),
            this.pysrv
        )
    }
}
