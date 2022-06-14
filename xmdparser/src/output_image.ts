import { resolve, join, dirname } from "path";
import { existsSync, readFileSync, statSync, writeFileSync, readdirSync, rmSync } from "fs";
import { ensurePathToDirExists } from "./utils";

interface OutputComponent {
    vpath: string;
    stream: string;
}

/** Describes a component which can perform serialization. */
export interface Serializer {
    /** Executes the serialization. */
    serialize(): void;
}

/**
 * Represents the output of a compile session.
 * This resource encapsulates all the necessary components of
 * the output and instructions on how to serialize it.
 */
export abstract class OutputImage implements Serializer {
    protected components: Array<OutputComponent>;

    /**
     * Initializes a new instance of this class.
     * @param imageName The name of the image, this will end up being
     *     the name of the collection where all files will be serialized.
     */
    constructor(
        protected imageName: string
    ) {
        this.components = [];
    }

    /**
     * Adds a file or directory to the image.
     * @param path The path to the file to read and add.
     * @param vpath The virtual path under which the value will be rendered.
     */
    public addFromFileSystem(path: string, vpath: string): void {
        if (this.checkVPathAlreadyExists(vpath)) {
            throw new Error(`Virtual path '${vpath}' already exists, cannot addd to output image`);
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
        this.components.push({
            vpath,
            stream: Buffer.from(value).toString("base64"),
        });
    }

    /**
     * Serializes the image.
     */
    public abstract serialize(): void;

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
        this.components.push({
            vpath,
            stream: readFileSync(path, { encoding: "base64" }),
        });
    }

    private checkVPathAlreadyExists(vpath: string): boolean {
        return this.components.findIndex(c => c.vpath.toLowerCase() === vpath.toLowerCase()) >= 0;
    }
}

export interface JsonPayload {
    name: string;
    files: Array<OutputComponent>;
}

/**
 * Describes an output image based on JSON.
 */
export class JsonPayloadOutputImage extends OutputImage {
    private _data: JsonPayload;

    /**
     * Initializes a new instance of this class.
     * @param imageName 
     */
    constructor(imageName: string) {
        super(imageName);
    }

    /** @inheritdoc */
    public serialize(): void {
        const payload: JsonPayload = {
            name: this.imageName,
            files: [],
        };

        for (const component of this.components) {
            payload.files.push(component);
        }

        this._data = { ...payload };
    }

    /**
     * After calling @see serialize, this call provides the serialized data.
     */
    public get data(): JsonPayload {
        return this._data;
    }
}

/**
 * Describes an output image based on the file system.
 */
export class FileSystemOutputImage extends OutputImage {
    /**
     * Initializes a new instance of this class.
     * @param imageName The name of the image.
     * @param dirPath The path to the directory where to emit the output.
     * @param overwrite A value indicating whether deleting a previously existing output.
     */
    constructor(
        imageName: string,
        private dirPath: string,
        private overwrite = true
    ) {
        super(imageName);
    }

    /** @inheritdoc */
    public serialize(): void {
        const exists = existsSync(this.dstDirPath);
        if (!this.overwrite && exists) {
            throw new Error(`Cannot serialize, non-overridable host directory '${this.dstDirPath}' already exists`);
        }
        if (this.overwrite && exists) {
            rmSync(this.dstDirPath, { recursive: true, force: true });
        }

        for (const component of this.components) {
            const content = Buffer.from(component.stream, "base64").toString("utf-8");
            if (!content || content.length === 0) {
                continue;
            }

            if (!this.checkVPath(component.vpath)) {
                throw new Error(`Cannot serialize, component's vpath '${component.vpath}' illegal`);
            }

            const dstFilePath = join(this.dstDirPath, component.vpath);
            if (existsSync(dstFilePath)) {
                throw new Error(`Cannot serialize '${dstFilePath}', already exists`);
            }
            ensurePathToDirExists(dirname(dstFilePath));

            writeFileSync(dstFilePath, content);
        }
    }

    /** Gets the path to the directory hosting the serialized content. */
    public get dstDirPath(): string {
        return resolve(this.dirPath);
    }

    private checkVPath(vpath: string): boolean {
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
    }
}

export function convertJsonPayloadToFileSystemOutputImage(
    payload: JsonPayload
): OutputImage {
    throw new Error();
}
