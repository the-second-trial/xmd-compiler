import { execFile } from "child_process";
import fetch from "node-fetch";
import { EOL } from "os";

import { BaseCodeServerResponse, CodeChunkEvaluator, CodeServer, CodeServerProcess, EvalResult } from "./code_srv";
import { Constants } from "./constants";
import { wait } from "./utils";

const baseAddr = "http://localhost:8080";

/** A code server for handling Python chunks. */
export abstract class PythonCodeServer implements CodeChunkEvaluator {
    private sid: string;
    protected srvLog: Array<string>;

    /**
     * Initializes a new instance of this class.
     */
    constructor() {
        this.srvLog = [];
    }

    /** @inheritdoc */
    public async eval(chunk: string): Promise<EvalResult> {
        if (!this.sid) {
            // No session yet, create one
            await this.createSession();
        }

        return await this.sendEvalChunkRequest(chunk);
    }

    protected async createSession(): Promise<void> {
        this.sid = await this.sendCreateSessionRequest();

        if (!this.sid) {
            throw new Error("Could not create a session");
        }
    }

    protected async sendCreateSessionRequest(): Promise<string | undefined> {
        const res = await this.sendPost("/newSession");
        if (res["result"] === "ok") {
            return res["sid"];
        }
        return undefined;
    }

    protected async sendEvalChunkRequest(src: string): Promise<EvalResult> {
        const res = await this.sendPost("/evalChunk", {
            sid: this.sid,
            src,
        });

        if (res["result"] !== "ok") {
            throw new Error(`An error occurred while evaluating a chunk: ${res.error}`);
        }

        return {
            value: res["expr_result"],
            type: res["expr_type"],
        };
    }

    protected async sendGet(route: string): Promise<BaseCodeServerResponse> {
        const res = await fetch(`${baseAddr}${route}`, { method: "GET" });
        return await res.json() as BaseCodeServerResponse;
    }

    protected async sendPost(route: string, body?: any): Promise<BaseCodeServerResponse> {
        const res = await fetch(`${baseAddr}${route}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        return await res.json() as BaseCodeServerResponse;
    }
}

/** A code server for handling Python chunks. */
export class LocalPythonCodeServer extends PythonCodeServer implements CodeServer {
    private process: CodeServerProcess;

    /**
     * Initializes a new instance of this class.
     * @param path The path to the 'main.py' file to run. If not provided, a call to
     *     @see startServer will fail as the server cannot be started.
     */
    constructor(private path: string) {
        super();
    }

    /** @inheritdoc */
    public async startServer(): Promise<void> {
        const srv = execFile("python", [this.path], (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                console.log(stderr);
            }
            console.log(stdout);
        });
        srv.stdout.setEncoding("utf8");
        srv.stdout.on("data", chunk => {
            this.srvLog.push(`[${new Date().toLocaleString()} - STDOUT] ${chunk.toString()}`);
        });
        srv.stderr.setEncoding("utf8");
        srv.stderr.on("data", chunk => {
            this.srvLog.push(`[${new Date().toLocaleString()} - STDERR] ${chunk.toString()}`);
        });

        // Poll until the server is online
        for (let i = Constants.PySrv.SRV_PING_MAX_ATTEMPTS_COUNT; i > 0; i--) {
            try {
                if (await this.sendPingRequest()) {
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
    public stopServer(): Promise<string> {
        return new Promise(resolve => {
            if (!this.process) {
                resolve("");
            }

            this.process.kill();
            this.process = undefined;

            resolve(this.srvLog.length === 0 ? "None" : this.srvLog.join(EOL));
        });
    }

    private async sendPingRequest(): Promise<boolean> {
        const res = await this.sendGet("/ping");
        if (res["result"] === "ok" && res["reply"] === "pong") {
            return true;
        }
        return false;
    }
}

/** A code server for handling Python chunks. */
export class RemotePythonCodeServer extends PythonCodeServer implements CodeServer {
    /**
     * Initializes a new instance of this class.
     */
    constructor() {
        super();
    }

    /** @inheritdoc */
    public startServer(): Promise<void> {
        return Promise.resolve();
    }

    /** @inheritdoc */
    public stopServer(): Promise<string> {
        return Promise.resolve("");
    }
}
