import { dirname, extname, resolve, join } from "path";
import { existsSync, statSync } from "fs";

import { idgen } from "./utils";
import { OutputImage } from "./output_image";

/** Handles resources for the different output types. */
export class ResourceManager {
    private idg: Generator<string>;

    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     */
    constructor(
        private outputImage: OutputImage
    ) {
        if (!outputImage) {
            throw new Error("Output image cannot be null or undefined");
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

        const ext = extname(pathToFile);
        const allowedExts = [".jpg", ".jpeg", ".png", ".svg"];
        if (allowedExts.findIndex(x => x === ext) < 0) {
            throw new Error(`Extension '${ext}' not allowed. Allowed extensions: ${allowedExts}`);
        }

        const immName = newName || this.idg.next().value + ext;

        this.outputImage.addFromFileSystem(
            pathToFile,
            join(this.outputResDirPath, this.outputImagesDirName, immName)
        );

        return webJoin(this.outputResourceDirName, this.outputImagesDirName, immName); 
    }

    /**
     * Places, in the output directory, the Mathjax sources.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveMathjax(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "mathjax"),
            join(this.outputResDirPath, "mathjax")
        );
        return webJoin(this.outputResourceDirName, "mathjax");
    }

    /**
     * Places, in the output directory, the 'tufte.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveTufteCss(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "tufte.css"),
            join(this.outputResDirPath, "tufte.css")
        );
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "et-book"),
            join(this.outputResDirPath, "et-book")
        );
        return webJoin(this.outputResourceDirName, "tufte.css");
    }

    /**
     * Places, in the output directory, the 'latex.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveLatexCss(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "latex.css"),
            join(this.outputResDirPath, "latex.css")
        );
        return webJoin(this.outputResourceDirName, "latex.css");
    }

    /**
     * Places, in the output directory, the TeX template sources for Tufte Handout.
     * @returns The relative paths to the copied resources
     *     ready to be used in import fields.
     */
    public serveTexTufteTemplateFiles(): Array<string> {
        const srcFiles = ["tufte-common.def", "tufte-handout.cls", "tufte.bst"];
        for (const srcFile of srcFiles) {
            this.outputImage.addFromFileSystem(
                join(this.resDirPath, "tex_tufte", srcFile),
                // To correctly compile, these files must be in the same dir as the output file
                join(this.outputDir, srcFile)
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
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_slides", "dist"),
            join(this.outputResDirPath, "dist")
        );
        return webJoin(this.outputResourceDirName, "dist");
    }

    /**
     * Places, in the output directory, the directory containing
     * the plugin files of Reveal.js.
     * @returns The path to the distribution directory.
     */
    public serveRevealJsPluginDir(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_slides", "plugin"),
            join(this.outputResDirPath, "plugin")
        );
        return webJoin(this.outputResourceDirName, "plugin");
    }

    private get outputDir(): string {
        return "/";
    }

    private get outputResDirPath(): string {
        return join(this.outputDir, this.outputResourceDirName);
    }

    private get resDirPath(): string {
        return resolve(__dirname, "res");
    }
}

function webJoin(...names: Array<string>) {
    return names.join("/");
}

function fileExists(src: string): boolean {
    return existsSync(src) && statSync(src)?.isFile();
}
