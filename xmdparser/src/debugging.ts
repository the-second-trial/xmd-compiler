const { EOL } = require("os");

import { ResourceImage } from "./resource_image";

/**
 * Singleton class for handling debug info on a compile session.
 */
export class DebugController {
    private static _instance: DebugController | undefined;

    private _ast: string;
    private _transformedAst: string;
    private _log: Array<{ timestamp: string, value: string }>;
    private _inputImage: ResourceImage;
    private _outputImage: ResourceImage;

    private constructor() {
        this._log = [];
    }

    /** Gets the singleton instance of this class. */
    public static get instance(): DebugController {
        if (!this._instance) {
            this._instance = new DebugController();
        }

        return this._instance;
    }

    /** Sets the computed AST. */
    public set ast(value: string) {
        this._ast = value;
    }

    /** Sets the computed transformed AST. */
    public set transformedAst(value: string) {
        this._transformedAst = value;
    }

    /** Adds a log entry. */
    public set log(value: string) {
        this._log.push({
            timestamp: new Date().toISOString(),
            value,
        });
    }

    /** Sets the input image. */
    public set inputImage(value: ResourceImage) {
        this._inputImage = value;
    }

    /** Sets the output image. */
    public set outputImage(value: ResourceImage) {
        this._outputImage = value;
    }

    /**
     * Saves all the collected debug info so far into a specified location.
     * @param dst The output image into which placing the debugging resources.
     */
    public save(dst: ResourceImage): void {
        const dstVPath = "/__debug";

        if (!this._ast && !this._transformedAst && this._log.length === 0) {
            return;
        }

        dst.addString(this._ast || "", dstVPath + "/ast.json");
        dst.addString(this._transformedAst || "", dstVPath + "/t-ast.json");
        dst.addString(
            this._log
                .map(x => `${x.timestamp} - ${x.value}`)
                .join(EOL),
            dstVPath + "/debug.txt"
        );

        dst.addString(this._inputImage.toString(), dstVPath + "/input_image.txt");
        dst.addString(this._outputImage.toString(), dstVPath + "/output_image.txt");
    }

    /** Clears all the collected data. */
    public flush(): void {
        this._ast = undefined;
        this._transformedAst = undefined;
        this._log = [];
        this._inputImage = undefined;
        this._outputImage = undefined;
    }
}

/**
 * Logs into the debugger.
 * @param msg The message to log.
 */
export function logDebug(msg: string): void {
    DebugController.instance.log = msg;
}
