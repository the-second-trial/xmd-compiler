import { extname, resolve, join } from "path";
import { existsSync, copyFileSync, statSync, mkdirSync, readdirSync, rmSync } from "fs";
import { idgen } from "./utils";

/** Describes the options for configuring the @see ResourceManager. */
export interface ResourceOptions {
    /** Output directory. */
    path: string;
    /** The directory where the input source is present. */
    srcPath: string;
}

/** Handles resources for the different output types. */
export class ResourceManager {
    private idg: Generator<string>;

    /**
     * Initializes a new instance of this class.
     * @param options The options.
     */
    constructor(
        private options: ResourceOptions
    ) {
        if (!dirExists(options.path)) {
            throw new Error(`Output directory '${options.path}' does not exist`);
        }

        this.idg = idgen("imm");
    }

    /**
     * Gets the name of the resources
     * folder which will be created in the output directory
     * when serving files.
     * */
    public get outputResourceDirName(): string {
        return "__res";
    }

    /**
     * Gets the name of the folder, under @see outputResourceDirName,
     * where all images will be placed.
     * */
     public get outputImagesDirName(): string {
        return "images";
    }

    /**
     * Places, in the output directory, an image file.
     * @param path The path to the image.
     * @param newName The name to give to the file once copied in the new location.
     *     If not provided, a generic ID will be created. If provided, it must include
     *     the extension.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveImage(path: string, newName?: string): string {
        const pathToFile = join(this.options.srcPath, path);

        if (!fileExists(pathToFile)) {
            throw new Error(`Image '${pathToFile}' does not exists, file not found`);
        }

        this.ensureOutputImagesDir();

        const ext = extname(pathToFile);
        const allowedExts = [".jpg", ".jpeg", ".png", ".svg"];
        if (allowedExts.findIndex(x => x === ext) < 0) {
            throw new Error(`Extension '${ext}' not allowed. Allowed extensions: ${allowedExts}`);
        }

        const immName = newName || this.idg.next().value + ext;
        const dst = resolve(this.options.path, this.outputResourceDirName, this.outputImagesDirName, immName);

        cp(pathToFile, dst);

        return webJoin(this.outputResourceDirName, this.outputImagesDirName, immName); 
    }

    /**
     * Places, in the output directory, the Mathjax sources.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveMathjax(): string {
        this.ensureOutputResourceDir();
        cp(
            join(this.resDirPath, "html_tufte", "mathjax"),
            resolve(this.options.path, this.outputResourceDirName, "mathjax")
        );
        return webJoin(this.outputResourceDirName, "mathjax");
    }

    /**
     * Places, in the output directory, the 'tufte.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveTufteCss(): string {
        this.ensureOutputResourceDir();
        cp(
            join(this.resDirPath, "html_tufte", "tufte.css"),
            resolve(this.options.path, this.outputResourceDirName, "tufte.css")
        );
        cp(
            join(this.resDirPath, "html_tufte", "et-book"),
            resolve(this.options.path, this.outputResourceDirName, "et-book")
        );
        return webJoin(this.outputResourceDirName, "tufte.css");
    }

    /**
     * Places, in the output directory, the 'latex.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveLatexCss(): string {
        this.ensureOutputResourceDir();
        cp(
            join(this.resDirPath, "html_tufte", "latex.css"),
            resolve(this.options.path, this.outputResourceDirName, "latex.css")
        );
        return webJoin(this.outputResourceDirName, "latex.css");
    }

    private get resDirPath(): string {
        return resolve(__dirname, "res");
    }

    private ensureOutputResourceDir(): void {
        ensureDir(resolve(this.options.path, this.outputResourceDirName));
    }

    private ensureOutputImagesDir(): void {
        this.ensureOutputResourceDir();
        ensureDir(resolve(this.options.path, this.outputResourceDirName, this.outputImagesDirName));
    }
}

function ensureDir(dirPath: string): void {
    if (dirExists(dirPath)) {
        return;
    }
    mkdirSync(dirPath);
}

function webJoin(...names: Array<string>) {
    return names.join("/");
}

function dirExists(src: string): boolean {
    return existsSync(src) && statSync(src)?.isDirectory();
}

function fileExists(src: string): boolean {
    return existsSync(src) && statSync(src)?.isFile();
}

function cp(src: string, dst: string): void {
    if (fileExists(src)) {
        copyFileSync(src, dst);
        return;
    }

    if (!dirExists(src)) {
        throw new Error("Not a directory and not a file, aborting");
    }

    if (dirExists(dst)) {
        rm(dst);
    }
    mkdirSync(dst);

    readdirSync(src).forEach(childItemName => {
        cp(join(src, childItemName), join(dst, childItemName));
    });
};

function rm(src: string): void {
    rmSync(src, { recursive: true, force: true });
}
