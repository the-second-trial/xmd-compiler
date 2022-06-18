import { resolve, join, dirname } from "path";
import { existsSync, readFileSync, statSync, writeFileSync, readdirSync, rmSync } from "fs";
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
    private _components: Array<ResourceComponent>;

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
            stream: Buffer.from(value).toString("base64"),
        });
    }

    /** Gets the name of  the image. */
    public get name(): string {
        return this.imageName;
    }

    /** Gets the components of the image. */
    public get components(): Array<ResourceComponent> {
        return this._components;
    }

    private addDir(path: string, vpath: string): void {
        if (existsSync(path) && statSync(path)?.isDirectory()) {
            readdirSync(path).forEach(childItemName => {
                this.addDir(join(path, childItemName), join(vpath, childItemName));
            });
        } else {
            this.addFile(path, vpath);
        }
    }

    private addFile(path: string, vpath: string): void {
        this._components.push({
            vpath,
            stream: readFileSync(path, { encoding: "base64" }),
        });
    }

    private checkVPathAlreadyExists(vpath: string): boolean {
        return this._components.findIndex(c => c.vpath.toLowerCase() === vpath.toLowerCase()) >= 0;
    }
}

export interface JsonPayload {
    name: string;
    files: Array<ResourceComponent>;
}

export function serializeResourceImageToJsonPayload(image: ResourceImage): JsonPayload {
    const payload: JsonPayload = {
        name: image.name,
        files: [],
    };

    for (const component of this.components) {
        payload.files.push(component);
    }

    return payload;
}

export function serializeResourceImageToFileSystem(image: ResourceImage, dirPath: string, overwrite = true): void {
    const checkVPath = (vpath: string): boolean => {
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

    const dstDirPath = resolve(dirPath);

    const exists = existsSync(dstDirPath);
    if (!overwrite && exists) {
        throw new Error(`Cannot serialize, non-overridable host directory '${dstDirPath}' already exists`);
    }
    if (overwrite && exists) {
        rmSync(dstDirPath, { recursive: true, force: true });
    }

    for (const component of image.components) {
        const content = Buffer.from(component.stream, "base64").toString("utf-8");
        if (!content || content.length === 0) {
            continue;
        }

        if (!checkVPath(component.vpath)) {
            throw new Error(`Cannot serialize, component's vpath '${component.vpath}' illegal`);
        }

        const dstFilePath = join(dstDirPath, component.vpath);
        if (existsSync(dstFilePath)) {
            throw new Error(`Cannot serialize '${dstFilePath}', already exists`);
        }
        ensurePathToDirExists(dirname(dstFilePath));

        writeFileSync(dstFilePath, content);
    }
}

export function convertJsonPayloadToFileSystemOutputImage(
    payload: JsonPayload
): ResourceImage {
    throw new Error("Not implemented");
}
