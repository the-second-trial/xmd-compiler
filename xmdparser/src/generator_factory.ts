import { basename, join } from "path";

import { Constants } from "./constants";
import { HtmlTufteGenerator } from "./templates/tufte/html_tufte/generator_html_tufte";
import { PythonCodeServer } from "./py_srv";
import { TexTufteGenerator } from "./templates/tufte/tex_tufte/generator_tex_tufte";
import { Generator } from "./generator";
import { HtmlSlidesGenerator } from "./templates/html_slides/generator_html_slides";
import { TexDocGenerator } from "./templates/tex_doc/generator_tex_doc";
import { Config } from "./config";
import { FileSystemOutputImage, JsonPayloadOutputImage, OutputImage } from "./output_image";
import { PdfOutputImage } from "./templates/tex/pdf_output_image";

export type PlatformTarget = "local" | "remote";

/** Creates a properly configured generator. */
export class GeneratorFactory {
    /**
     * Initializes a new instance of this class.
     * @param config The configuration object.
     * @param pysrv The Python server.
     */
    constructor(
        private config: Config,
        private pysrv: PythonCodeServer,
        private platformTarget: PlatformTarget
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
            this.pysrv
        )
    }

    private createForTexTufte(): TexTufteGenerator {
        return new TexTufteGenerator(
            this.config.src,
            this.createOutputImageForPDF(),
            this.pysrv,
            this.config.pdfLatexPath
        )
    }

    private createForHtmlSlides(): HtmlSlidesGenerator {
        return new HtmlSlidesGenerator(
            this.config.src,
            this.createOutputImage(),
            this.pysrv
        )
    }

    private createForTexDoc(): TexDocGenerator {
        return new TexDocGenerator(
            this.config.src,
            this.createOutputImageForPDF(),
            this.pysrv,
            this.config.pdfLatexPath
        )
    }

    private createOutputImage(): OutputImage {
        const name = this.imageName;

        if (this.platformTarget === "local") {
            return new FileSystemOutputImage(name, this.outputFolder);
        }

        return new JsonPayloadOutputImage(name);
    }

    private createOutputImageForPDF(): OutputImage {
        const name = this.imageName;

        if (this.platformTarget === "local") {
            return this.config.pdfLatexPath
                ? new PdfOutputImage(this.config.pdfLatexPath, name, this.outputFolder)
                : new FileSystemOutputImage(name, this.outputFolder);
        }

        return new JsonPayloadOutputImage(name);
    }

    private get outputFolder(): string {
        return join(this.config.output, `${name}_${this.config.template || "none"}`);
    }

    private get imageName(): string {
        return basename(this.config.src, ".md");
    }
}
