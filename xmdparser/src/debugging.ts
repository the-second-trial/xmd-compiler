const { EOL } = require("os");
import { OutputImage } from "./output_image";

/**
 * Singleton class for handling debug info on a compile session.
 */
export class DebugController {
    private static _instance: DebugController | undefined;

    private _ast: string;
    private _transformedAst: string;
    private _log: Array<{ timestamp: string, value: string }>;

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

    /**
     * Saves all the collected debug info so far into a specified location.
     * @param outputImage The output image into which placing the debugging resources.
     */
    public save(outputImage: OutputImage): void {
        const dst = "/__debug";

        if (!this._ast && !this._transformedAst && this._log.length === 0) {
            return;
        }

        outputImage.addString(this._ast || "", dst + "/ast.json");
        outputImage.addString(this._transformedAst || "", dst + "/t-ast.json");
        outputImage.addString(
            this._log
                .map(x => `${x.timestamp} - ${x.value}`)
                .join(EOL),
            dst + "/debug.txt"
        );
    }

    /** Clears all the collected data. */
    public flush(): void {
        this._ast = undefined;
        this._transformedAst = undefined;
        this._log = [];
    }
}

/**
 * Logs into the debugger.
 * @param msg The message to log.
 */
export function logDebug(msg: string): void {
    DebugController.instance.log = msg;
}
