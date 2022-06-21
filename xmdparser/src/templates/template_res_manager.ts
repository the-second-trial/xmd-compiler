import { resolve, join } from "path";

import { ResourceImage, resourcePathJoin } from "../resource_image";

export abstract class ResourceManager {
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
}

/** Handles resources for the different output types. */
export class TemplateResourceManager extends ResourceManager {
    /**
     * Initializes a new instance of this class.
     * @param outputImage The output image to use.
     */
    constructor(
        private outputImage: ResourceImage
    ) {
        super();

        if (!outputImage) {
            throw new Error("Output image cannot be null or undefined");
        }
    }

    /**
     * Places, in the output directory, the Mathjax sources.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveMathjax(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "mathjax"),
            resourcePathJoin(this.outputResDirPath, "mathjax")
        );
        return resourcePathJoin(this.outputResourceDirName, "mathjax");
    }

    /**
     * Places, in the output directory, the 'tufte.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveTufteCss(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "tufte.css"),
            resourcePathJoin(this.outputResDirPath, "tufte.css")
        );
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "et-book"),
            resourcePathJoin(this.outputResDirPath, "et-book")
        );
        return resourcePathJoin(this.outputResourceDirName, "tufte.css");
    }

    /**
     * Places, in the output directory, the 'latex.css' file.
     * @returns The relative path to the copied resource
     *     ready to be used in import fields.
     */
    public serveLatexCss(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_tufte", "latex.css"),
            resourcePathJoin(this.outputResDirPath, "latex.css")
        );
        return resourcePathJoin(this.outputResourceDirName, "latex.css");
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
                resourcePathJoin(this.outputDir, srcFile)
            );
        }
        return srcFiles.map(x => resourcePathJoin(this.outputResourceDirName, x));
    }

    /**
     * Places, in the output directory, the directory containing
     * the distribution files of Reveal.js.
     * @returns The path to the distribution directory.
     */
    public serveRevealJsDistDir(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_slides", "dist"),
            resourcePathJoin(this.outputResDirPath, "dist")
        );
        return resourcePathJoin(this.outputResourceDirName, "dist");
    }

    /**
     * Places, in the output directory, the directory containing
     * the plugin files of Reveal.js.
     * @returns The path to the distribution directory.
     */
    public serveRevealJsPluginDir(): string {
        this.outputImage.addFromFileSystem(
            join(this.resDirPath, "html_slides", "plugin"),
            resourcePathJoin(this.outputResDirPath, "plugin")
        );
        return resourcePathJoin(this.outputResourceDirName, "plugin");
    }

    private get outputDir(): string {
        return "/";
    }

    private get outputResDirPath(): string {
        return resourcePathJoin(this.outputDir, this.outputResourceDirName);
    }

    private get resDirPath(): string {
        return resolve(__dirname, "res");
    }
}
