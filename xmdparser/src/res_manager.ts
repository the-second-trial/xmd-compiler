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
    public get resourceDirName(): string {
        return "__res";
    }

    /**
     * Places, in the output directory, the Mathjax sources.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveMathjax(): string {
        cp(
            join(this.resDirPath, "html_tufte", "mathjax"),
            resolve(this.options.path, this.resourceDirName, "mathjax")
        );
        return join(this.resourceDirName, "mathjax");
    }

    /**
     * Places, in the output directory, the 'tufte.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveTufteCss(): string {
        return "";
    }

    /**
     * Places, in the output directory, the 'latex.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveLatexCss(): string {
        return "";
    }

    private get resDirPath(): string {
        return resolve(__dirname, "res");
    }
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
