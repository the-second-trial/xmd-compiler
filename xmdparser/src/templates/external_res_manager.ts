import { extname, join } from "path";

import { ResourceImage } from "../resource_image";
import { idgen } from "../utils";
import { ResourceManager } from "./template_res_manager";

/** Handles resources for the different output types. */
export class ExternalResourceManager extends ResourceManager {
    private idg: Generator<string>;

    /**
     * Initializes a new instance of this class.
     * @param inputImage The input image.
     * @param outputImage The output image.
     */
    constructor(
        private inputImage: ResourceImage,
        private outputImage: ResourceImage
    ) {
        super();

        if (!inputImage) {
            throw new Error("Input image cannot be null or undefined");
        }
        if (!outputImage) {
            throw new Error("Output image cannot be null or undefined");
        }

        this.idg = idgen("imm");
    }

    /**
     * Ads an image from the input image to the output image.
     * @param vpath The source vpath.
     * @returns The path ready for import.
     */
    public serveImage(vpath: string): string {
        const ext = extname(vpath);
        const allowedExts = [".jpg", ".jpeg", ".png", ".svg"];
        if (allowedExts.findIndex(x => x === ext) < 0) {
            throw new Error(`Extension '${ext}' not allowed. Allowed extensions: ${allowedExts}`);
        }
    
        const immName = this.idg.next().value + ext;
        const newVPath = [this.outputResourceDirName, this.outputImagesDirName, immName].join("/")
    
        this.outputImage.addFromImage(this.inputImage, newVPath);
    
        return newVPath;
    }
}
