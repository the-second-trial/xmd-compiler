import { resolve, join } from "path";
import { existsSync, readFileSync, statSync, writeFileSync, readdirSync } from "fs";

interface OutputComponent {
    vpath: string;
    stream: string;
}

type OutputImageOperationType =
    | "compilePdf";

interface OutputImageOperation {
    type: OutputImageOperationType;
    params: Array<string>;
}

/**
 * Represents the output of a compile session.
 * This resource encapsulates all the necessary components of
 * the output and instructions on how to serialize it.
 */
export abstract class OutputImage {
    protected components: Array<OutputComponent>;
    protected postProcessOperations: Array<OutputImageOperation>;

    /**
     * Initializes a new instance of this class.
     * @param imageName The name of the image, this will end up being
     *     the name of the collection where all files will be serialized.
     */
    constructor(
        protected imageName: string
    ) {
    }

    public addCompilePdfOperation(params: Array<string>): void {
        
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
     * @param imageName 
     * @param dirPath 
     */
    constructor(
        imageName: string,
        private dirPath: string
    ) {
        super(imageName);
    }

    /** @inheritdoc */
    public serialize(): void {
        for (const component of this.components) {
            const content = Buffer.from(component.stream, "base64").toString("utf-8");
            if (!content || content.length === 0) {
                continue;
            }

            const dstFilePath = join(resolve(this.dirPath), this.imageName);
            if (existsSync(dstFilePath)) {
                throw new Error(`Cannot serialize '${dstFilePath}', already exists`);
            }

            writeFileSync(dstFilePath, content);
        }
    }
}

export function convertJsonPayloadToFileSystemOutputImage(
    payload: JsonPayload
): OutputImage {
    throw new Error();
}
