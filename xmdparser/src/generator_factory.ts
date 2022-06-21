import { basename } from "path";

import { Constants } from "./constants";
import { HtmlTufteGenerator } from "./templates/tufte/html_tufte/generator_html_tufte";
import { TexTufteGenerator } from "./templates/tufte/tex_tufte/generator_tex_tufte";
import { Generator } from "./generator";
import { HtmlSlidesGenerator } from "./templates/html_slides/generator_html_slides";
import { TexDocGenerator } from "./templates/tex_doc/generator_tex_doc";
import { Config } from "./config";
import { ResourceImage } from "./resource_image";
import { CodeServer } from "./code_srv";
import { InputImageFactory } from "./input_image_factory";
import { DebugController } from "./debugging";

/** Creates a properly configured generator. */
export class GeneratorFactory {
    /**
     * Initializes a new instance of this class.
     * @param config The configuration object.
     * @param pysrv The Python server.
     */
    constructor(
        private config: Config,
        private pysrv: CodeServer
    ) {
    }

    /**
     * Creates the generator.
     * @returns A @see Generator.
     */
    public create(): Generator {
        if (this.config.template === Constants.OutputTypes.HTML_TUFTE) {
            return this.createForHtmlTufte();
        }

        if (this.config.template === Constants.OutputTypes.TEX_TUFTE) {
            return this.createForTexTufte();
        }

        if (this.config.template === Constants.OutputTypes.HTML_SLIDES) {
            return this.createForHtmlSlides();
        }

        if (this.config.template === Constants.OutputTypes.TEX_DOC) {
            return this.createForTexDoc();
        }

        throw new Error(`Cannot create generator, output type '${this.config.template}' not recognized`);
    }

    private createForHtmlTufte(): HtmlTufteGenerator {
        return new HtmlTufteGenerator(
            this.config.src,
            this.createOutputImage(),
            this.createInputImage(),
            this.pysrv
        )
    }

    private createForTexTufte(): TexTufteGenerator {
        return new TexTufteGenerator(
            this.config.src,
            this.createOutputImage(),
            this.createInputImage(),
            this.pysrv,
            this.config.pdfLatexPath
        )
    }

    private createForHtmlSlides(): HtmlSlidesGenerator {
        return new HtmlSlidesGenerator(
            this.config.src,
            this.createOutputImage(),
            this.createInputImage(),
            this.pysrv
        )
    }

    private createForTexDoc(): TexDocGenerator {
        return new TexDocGenerator(
            this.config.src,
            this.createOutputImage(),
            this.createInputImage(),
            this.pysrv,
            this.config.pdfLatexPath
        )
    }

    private createOutputImage(): ResourceImage {
        const image = new ResourceImage(this.imageName);
        DebugController.instance.outputImage = image;
        return image;
    }

    private createInputImage(): ResourceImage {
        const image = new InputImageFactory(this.config.src).create();
        DebugController.instance.inputImage = image;
        return image;
    }

    private get imageName(): string {
        return basename(this.config.src, ".md");
    }
}
