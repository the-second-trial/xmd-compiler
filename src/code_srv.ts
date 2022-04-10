export interface CodeServerProcess {
    kill: (signal?: number) => void;
}

export interface EvalResult {
    value: string | number | undefined;
    type: string | undefined;
};

/** Describes a component capable of evaluating code chunks. */
export interface CodeChunkEvaluator {
    eval: (chunk: string) => Promise<EvalResult>;
}

/** Describes a Server for handling code chunks. */
export interface CodeServer extends CodeChunkEvaluator {
    startServer: () => Promise<void>;
    stopServer: () => Promise<void>;
}

/** Describes a response from the code server. */
export interface BaseCodeServerResponse {
    result: "ok" | "error";
    error?: string;
    [key: string]: any;
}
