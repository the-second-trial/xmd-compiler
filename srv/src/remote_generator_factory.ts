import { Constants } from "../../xmdparser/src/constants";
import { HtmlTufteGenerator } from "../../xmdparser/src/templates/tufte/html_tufte/generator_html_tufte";
import { TexTufteGenerator } from "../../xmdparser/src/templates/tufte/tex_tufte/generator_tex_tufte";
import { Generator } from "../../xmdparser/src/generator";
import { HtmlSlidesGenerator } from "../../xmdparser/src/templates/html_slides/generator_html_slides";
import { TexDocGenerator } from "../../xmdparser/src/templates/tex_doc/generator_tex_doc";
import { ResourceImage } from "../../xmdparser/src/resource_image";
import { CodeServer } from "../../xmdparser/src/code_srv";
import { DebugController } from "../../xmdparser/src/debugging";

/** Creates a properly configured generator. */
export class RemoteGeneratorFactory {
    /**
     * Initializes a new instance of this class.
     * @param name The name to assign to the compile unit.
     * @param inputImage The input image.
     * @param template The template to use.
     * @param pysrv The Python server.
     */
    constructor(
        private name: string,
        private inputImage: ResourceImage,
        private template: string,
        private pysrv: CodeServer
    ) {
    }

    /**
     * Creates the generator.
     * @returns A @see Generator.
     */
    public create(): Generator {
        if (this.template === Constants.OutputTypes.HTML_TUFTE) {
            return this.createForHtmlTufte();
        }

        if (this.template === Constants.OutputTypes.TEX_TUFTE) {
            return this.createForTexTufte();
        }

        if (this.template === Constants.OutputTypes.HTML_SLIDES) {
            return this.createForHtmlSlides();
        }

        if (this.template === Constants.OutputTypes.TEX_DOC) {
            return this.createForTexDoc();
        }

        throw new Error(`Cannot create generator, output type '${this.template}' not recognized`);
    }

    private createForHtmlTufte(): HtmlTufteGenerator {
        return new HtmlTufteGenerator(
            this.createOutputImage(),
            this.inputImage,
            this.pysrv
        )
    }

    private createForTexTufte(): TexTufteGenerator {
        return new TexTufteGenerator(
            this.createOutputImage(),
            this.inputImage,
            this.pysrv
        )
    }

    private createForHtmlSlides(): HtmlSlidesGenerator {
        return new HtmlSlidesGenerator(
            this.createOutputImage(),
            this.inputImage,
            this.pysrv
        )
    }

    private createForTexDoc(): TexDocGenerator {
        return new TexDocGenerator(
            this.createOutputImage(),
            this.inputImage,
            this.pysrv
        )
    }

    private createOutputImage(): ResourceImage {
        const image = new ResourceImage(this.imageName);
        DebugController.instance.outputImage = image;
        return image;
    }

    private get imageName(): string {
        return this.name;
    }
}
