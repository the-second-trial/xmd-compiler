import { join, basename } from "path";

import { ResourceImage, serializeResourceImageToFileSystem } from "./resource_image";
import { serializeResourceImageToPdfFileSystem } from "./templates/tex/pdf_resource_image";

/** Serializes the output. */
export class Serializer {
    /**
     * Iitializes a new instance of this class.
     * @param config The configuration.
     * @param outputImage The output image to serialize.
     */
    constructor(
        private src: string,
        private output: string,
        private template: string,
        private pdfLatexPath: string | undefined,
        private outputImage: ResourceImage
    ) {
    }

    /**
     * Serializes the output.
     */
    public serialize(): void {
        const imageName = basename(this.src, ".md");
        const outputFolder = join(this.output, `${imageName}_${this.template || "none"}`);

        if (this.pdfLatexPath && this.pdfLatexPath.length > 0) {
            serializeResourceImageToPdfFileSystem(this.outputImage, this.pdfLatexPath, outputFolder);
            return;
        }
        
        serializeResourceImageToFileSystem(this.outputImage, outputFolder);
    }
}
