import { execFile } from "child_process";
import fetch from "node-fetch";

import { CodeServer, CodeServerProcess } from "./code_srv";
import { Constants } from "./constants";
import { wait } from "./utils";

/** A code server for handling Python chunks. */
export class PythonCodeServer implements CodeServer {
    private process: CodeServerProcess;

    constructor(private path: string) {
    }

    /** @inheritdoc */
    public async startServer(): Promise<void> {
        const srv = execFile("python", [this.path]);
    
        // Poll until the server is online
        for (let i = Constants.PySrv.SRV_PING_MAX_ATTEMPTS_COUNT; i > 0; i--) {
            try {
                const res = await fetch("http://localhost:8080/ping");
                const body = await res.json() as any;
                if (body["result"] === "ok" && body["reply"] === "pong") {
                    this.process = srv;
                    return;
                }
            } catch (error) {
                // Swallow
            }
    
            await wait(Constants.PySrv.SRV_PING_WAIT_RETRY_MS);
        }
    
        throw new Error("Max attempts reached");
    }

    /** @inheritdoc */
    public stopServer(): Promise<void> {
        return new Promise(resolve => {
            this.process.kill();
            this.process = undefined;
            
            resolve();
        });
    }
}
