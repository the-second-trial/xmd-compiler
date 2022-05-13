import { Constants } from "./constants";
import { HtmlTufteGenerator } from "./templates/tufte/html_tufte/generator_html_tufte";
import { PythonCodeServer } from "./py_srv";
import { TexTufteGenerator } from "./templates/tufte/tex_tufte/generator_tex_tufte";
import { Generator } from "./generator";
import { HtmlSlidesGenerator } from "./templates/html_slides/generator_html_slides";
import { TexDocGenerator } from "./templates/tex_doc/generator_tex_doc";

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

        if (this.outputType === Constants.OutputTypes.HTML_SLIDES) {
            return this.createForHtmlSlides();
        }

        if (this.outputType === Constants.OutputTypes.TEX_DOC) {
            return this.createForTexDoc();
        }

        throw new Error(`Cannot create generator, output type '${this.outputType}' not recognized`);
    }

    private createForHtmlTufte(): HtmlTufteGenerator {
        return new HtmlTufteGenerator(
            this.outputDir,
            this.srcPath,
            this.pysrv
        )
    }

    private createForTexTufte(): TexTufteGenerator {
        return new TexTufteGenerator(
            this.outputDir,
            this.srcPath,
            this.pysrv
        )
    }

    private createForHtmlSlides(): HtmlSlidesGenerator {
        return new HtmlSlidesGenerator(
            this.outputDir,
            this.srcPath,
            this.pysrv
        )
    }

    private createForTexDoc(): TexDocGenerator {
        return new TexDocGenerator(
            this.outputDir,
            this.srcPath,
            this.pysrv
        )
    }
}
