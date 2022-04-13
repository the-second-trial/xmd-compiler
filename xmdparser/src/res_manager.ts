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
    }

    public serveMathjax(): void {
        cp(
            join(this.resDirPath, "html_tufte", "mathjax"),
            resolve(this.options.path, "__res")
        );
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
