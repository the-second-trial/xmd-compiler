import { basename, dirname, extname, resolve, join } from "path";
import { existsSync, copyFileSync, statSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "fs";
import { idgen } from "./utils";

/** Describes the options for configuring the @see ResourceManager. */
export interface ResourceOptions {
    /** Directory where the output directory will be created. */
    outputLocDir: string;
    /** The input source file path. */
    srcPath: string;
    /** A name to identify the output type. */
    outputName: string;
    /** Name (with ext) to give to the output file. */
    outputFileName: string;
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
        if (!dirExists(options.outputLocDir)) {
            throw new Error(`Output location directory '${options.outputLocDir}' does not exist`);
        }

        this.createOutputDir();

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
     * Writes the output file.
     * @param output The output to write.
     * @returns The path where the file has been saved.
     */
    public writeToPutputFile(output: string): string {
        const path = resolve(this.outputDir, `${this.options.outputFileName}`);
        writeFileSync(path, output);

        return path;
    }

    /**
     * Places, in the output directory, an image file.
     * @param path The path to the image (relative to the source dir).
     * @param newName The name to give to the file once copied in the new location.
     *     If not provided, a generic ID will be created. If provided, it must include
     *     the extension.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveImage(path: string, newName?: string): string {
        const pathToFile = join(dirname(this.outputDir), path);

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
        const dst = resolve(this.outputResDirPath, this.outputImagesDirName, immName);

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
            resolve(this.outputResDirPath, "mathjax")
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
            resolve(this.outputResDirPath, "tufte.css")
        );
        cp(
            join(this.resDirPath, "html_tufte", "et-book"),
            resolve(this.outputResDirPath, "et-book")
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
            resolve(this.outputResDirPath, "latex.css")
        );
        return webJoin(this.outputResourceDirName, "latex.css");
    }

    /**
     * Places, in the output directory, the TeX template sources for Tufte Handout.
     * @returns The relative paths to the copied resources
     *     ready to be used in import fields.
     */
    public serveTexTufteTemplateFiles(): Array<string> {
        this.ensureOutputResourceDir();
        const srcFiles = ["tufte-common.def", "tufte-handout.cls", "tufte.bst"];
        for (const srcFile of srcFiles) {
            cp(
                join(this.resDirPath, "tex_tufte", srcFile),
                // To correctly compile, these files must be in the same dir as the output file
                resolve(this.outputDir, srcFile)
            );
        }
        return srcFiles.map(x => webJoin(this.outputResourceDirName, x));
    }

    /**
     * Places, in the output directory, the directory containing
     * the distribution files of Reveal.js.
     * @returns The path to the distribution directory.
     */
    public serveRevealJsDistDir(): string {
        this.ensureOutputResourceDir();
        cp(
            join(this.resDirPath, "html_slides", "dist"),
            resolve(this.outputResDirPath, "dist")
        );
        return webJoin(this.outputResourceDirName, "dist");
    }

    /**
     * Places, in the output directory, the directory containing
     * the plugin files of Reveal.js.
     * @returns The path to the distribution directory.
     */
    public serveRevealJsPluginDir(): string {
        this.ensureOutputResourceDir();
        cp(
            join(this.resDirPath, "html_slides", "plugin"),
            resolve(this.outputResDirPath, "plugin")
        );
        return webJoin(this.outputResourceDirName, "plugin");
    }

    private createOutputDir(): void {
        if (dirExists(this.outputDir)) {
            rm(this.outputDir);
        }
        mkdirSync(this.outputDir);
    }

    private get outputDir(): string {
        return resolve(this.options.outputLocDir, basename(this.options.srcPath, ".md") + "_" + this.options.outputName);
    }

    private get outputResDirPath(): string {
        return resolve(this.outputDir, this.outputResourceDirName);
    }

    private get resDirPath(): string {
        return resolve(__dirname, "res");
    }

    private ensureOutputResourceDir(): void {
        ensureDir(this.outputResDirPath);
    }

    private ensureOutputImagesDir(): void {
        this.ensureOutputResourceDir();
        ensureDir(resolve(this.outputResDirPath, this.outputImagesDirName));
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
