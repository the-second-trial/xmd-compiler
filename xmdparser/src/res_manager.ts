import { resolve, join } from "path";
import { existsSync, copyFileSync, statSync, mkdirSync, readdirSync, rmSync } from "fs";

/** Describes the options for configuring the @see ResourceManager. */
export interface ResourceOptions {
    path: string;
}

/** Handles resources for the different output types. */
export class ResourceManager {
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
        const dirPath = resolve(this.options.path, this.outputResourceDirName);
        if (dirExists(dirPath)) {
            return;
        }
        mkdirSync(dirPath);
    }
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
