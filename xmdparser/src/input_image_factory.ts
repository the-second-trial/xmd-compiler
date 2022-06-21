import { dirname, resolve, join } from "path";
import { existsSync, readFileSync } from "fs";

import { ResourceImage } from "./resource_image";
import { ReferenceScanner } from "./reference_scanner";

/** Creates an input image from a file. */
export class InputImageFactory {
    private dirPath: string; // Path to image root
    private src: string;

    constructor(srcPath: string) {
        this.loadSrc(srcPath);
    }

    /**
     * Creates the input image.
     * @returns A @see ResourceImage.
     */
    public create(): ResourceImage {
        const references = new ReferenceScanner().scan(this.src);
        const inputImage = new ResourceImage("input");

        for (const reference of references) {
            inputImage.addFromFileSystem(join(this.dirPath, reference.vpath), reference.vpath);
        }

        return inputImage;
    }

    private loadSrc(path: string) {
        const pathToSrc = resolve(path);

        if (!existsSync(pathToSrc)) {
            throw new Error(`Cannot find input src file '${path}', cannot generate input image`);
        }

        this.src = readFileSync(pathToSrc).toString("utf8");
        this.dirPath = dirname(pathToSrc);
    }
}
