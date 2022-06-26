import { join, basename } from "path";

import { Config } from "../../cli/src/config";
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
        private config: Config,
        private outputImage: ResourceImage
    ) {
    }

    /**
     * Serializes the output.
     */
    public serialize(): void {
        const imageName = basename(this.config.src, ".md");
        const outputFolder = join(this.config.output, `${imageName}_${this.config.template || "none"}`);

        if (this.config.pdfLatexPath && this.config.pdfLatexPath.length > 0) {
            serializeResourceImageToPdfFileSystem(this.outputImage, this.config.pdfLatexPath, outputFolder);
            return;
        }
        
        serializeResourceImageToFileSystem(this.outputImage, outputFolder);
    }
}
