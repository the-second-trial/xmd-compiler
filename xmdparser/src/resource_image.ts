import { resolve, join, dirname } from "path";
import { existsSync, readFileSync, statSync, writeFileSync, readdirSync, rmSync } from "fs";
const { EOL } = require("os");

import { ensurePathToDirExists } from "./utils";

export interface ResourceComponent {
    vpath: string;
    stream: string;
}

/**
 * Represents the resource image of a compile session.
 * This artifact encapsulates all the necessary components of
 * the resource and instructions on how to serialize it.
 */
export class ResourceImage {
    private _components: Array<ResourceComponent>; // TODO: Use a dict

    /**
     * Initializes a new instance of this class.
     * @param imageName The name of the image, this will end up being
     *     the name of the collection where all files will be serialized.
     */
    constructor(
        private imageName: string
    ) {
        this._components = [];
    }

    /**
     * Adds a file or directory to the image.
     * @param path The path to the file to read and add.
     * @param vpath The virtual path under which the value will be rendered.
     */
    public addFromFileSystem(path: string, vpath: string): void {
        if (this.checkVPathAlreadyExists(vpath)) {
            throw new Error(`Virtual path '${vpath}' already exists, cannot add to output image`);
        }

        if (!existsSync(path)) {
            throw new Error(`Cannot add file to output image, '${path}' could not be found`);
        }

        if (statSync(path).isFile()) {
            // File => just add
            this.addFile(path, vpath);

            return;
        }

        // Directory => Add all its contents
        this.addDir(path, vpath);
    }

    /**
     * Adds a string to the image.
     * @param value The value to add.
     * @param vpath The virtual path under which the value will be rendered.
     */
    public addString(value: string, vpath: string): void {
        this._components.push({
            vpath,
            stream: Buffer.from(value, "utf-8").toString("base64"),
        });
    }

    /**
     * Adds a component from another image.
     * @param image The source image.
     * @param src The source vpath.
     * @param dst The destination vpath.
     */
    public addFromImage(image: ResourceImage, src: string, dst: string): void {
        if (!image.getComponentByVPath(src)) {
            throw new Error(`Cannot find component '${src}' in source image`);
        }
        if (this.getComponentByVPath(dst)) {
            throw new Error(`Found component '${dst}' in this image, cannot add duplicate`);
        }

        this._components.push({ ...image.getComponentByVPath(src), vpath: dst });
    }

    /** Gets the name of  the image. */
    public get name(): string {
        return this.imageName;
    }

    /** Gets the components of the image. */
    public get components(): Array<ResourceComponent> {
        return this._components;
    }

    /**
     * Finds a component from its vpath.
     * @param vpath The input vpath.
     * @returns The found component or undefined.
     */
    public getComponentByVPath(vpath: string): ResourceComponent | undefined {
        return this._components.find(component => component.vpath === vpath);
    }

    /**
     * Prints to string.
     */
    public toString(): string {
        const buffer: Array<string> = [`Res Image '${this.imageName}'`];
        this._components.forEach(component => buffer.push(`- ${component.vpath}: ${component.vpath.length}`));
        return buffer.join(EOL);
    }

    private addDir(path: string, vpath: string): void {
        if (existsSync(path) && statSync(path)?.isDirectory()) {
            readdirSync(path).forEach(childItemName => {
                this.addDir(join(path, childItemName), resourcePathJoin(vpath, childItemName));
            });
        } else {
            this.addFile(path, vpath);
        }
    }

    private addFile(path: string, vpath: string): void {
        this._components.push({
            vpath,
            stream: Buffer.from(readFileSync(path, { encoding: "binary" }), "binary").toString("base64"),
        });
    }

    private checkVPathAlreadyExists(vpath: string): boolean {
        return this._components.findIndex(c => c.vpath.toLowerCase() === vpath.toLowerCase()) >= 0;
    }
}

/**
 * When a file is serialized to binary stream and converted into base64,
 * this function will revert the procvess to retrieve the original bitstream and,
 * from there, deserialize further into utf-8.
 * @param stream The input stream.
 */
export function deserializeStreamToUtf8(stream: string): string {
    const bitstream = Buffer.from(stream, "base64").toString("binary");
    const utf = Buffer.from(bitstream, "binary").toString("utf-8");
    return utf;
}

/**
 * Path joins for vpaths.
 * @param names The names to join.
 * @returns A correct vpath.
 */
export function resourcePathJoin(...names: Array<string>): string {
    return join(...names).replace(/\\/g, "/");
}

/** Describes a JSON payload. */
export interface JsonPayload {
    name: string;
    files: Array<ResourceComponent>;
}

/**
 * Checks whether an input string is a valid vpath.
 * @param vpath The candidate vpath.
 * @returns A value indicating whether the input vpath is correctly formatted.
 */
export function checkVPath(vpath: string): boolean {
    if (vpath.length < 2) {
        return false;
    }
    if (vpath[0] !== "/") {
        return false;
    }
    if (vpath[1] === "/") {
        return false;
    }
    return true;
};

/**
 * Returns the correct vpath for a resource.
 * @param vpath The candidate vpath/
 * @returns The correctly formatted vpath.
 */
export function ensureVPathSyntax(vpath: string): string {
    if (vpath[0] !== "/") {
        return `/${vpath}`;
    }
    return vpath;
};

/**
 * Serializes a @see ResourceImage into a @see JsonPayload.
 * @param image The image to serialize.
 * @returns The corresponding @see JsonPayload.
 */
export function serializeResourceImageToJsonPayload(image: ResourceImage): JsonPayload {
    const payload: JsonPayload = {
        name: image.name,
        files: [],
    };

    for (const component of image.components) {
        payload.files.push({ ...component });
    }

    return payload;
}

/**
 * Deserializes an image starting from a @see JsonPayload.
 * @param payload The payload to deserialize.
 * @returns The corresponding @see ResourceImage.
 */
export function deserializeResourceImageFromJsonPayload(payload: JsonPayload): ResourceImage {
    const image = new ResourceImage(`deserialized_${payload.name || "untitled"}`);

    for (const component of payload.files) {
        image.addString(component.stream, component.vpath);
    }

    return image;
}

/**
 * Serializes a @see ResourceImage into FS.
 * @param image The image.
 * @param dirPath The destination path.
 * @param overwrite Whether to overwrite components.
 */
export function serializeResourceImageToFileSystem(image: ResourceImage, dirPath: string, overwrite = true): void {
    const dstDirPath = resolve(dirPath);

    const exists = existsSync(dstDirPath);
    if (!overwrite && exists) {
        throw new Error(`Cannot serialize, non-overridable host directory '${dstDirPath}' already exists`);
    }
    if (overwrite && exists) {
        rmSync(dstDirPath, { recursive: true, force: true });
    }

    for (const component of image.components) {
        const content = Buffer.from(component.stream, "base64").toString("binary");
        if (!content || content.length === 0) {
            continue;
        }

        if (!checkVPath(component.vpath)) {
            throw new Error(`Cannot serialize, component's vpath '${component.vpath}' illegal`);
        }

        const dstFilePath = join(dstDirPath, component.vpath);
        if (existsSync(dstFilePath)) {
            console.error("The image has duplicates", image.toString());
            throw new Error(`Cannot serialize '${dstFilePath}', already exists`);
        }
        ensurePathToDirExists(dirname(dstFilePath));

        writeFileSync(dstFilePath, content, { encoding: "binary" });
    }
}
