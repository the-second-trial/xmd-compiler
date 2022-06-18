import { dirname, resolve } from "path";
import { existsSync, readFileSync } from "fs";

/** Creates an input image from a file. */
export class InputImageFactory {
    private dirPath: string; // Path to image root
    private src: string;

    constructor(srcPath: string) {
        this.loadSrc(srcPath);
    }

    public create() {
        const inputImage = "";
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
