export interface CodeServerProcess {
    kill: (signal?: number) => void;
}

/** Describes a Server for handling code chunks. */
export interface CodeServer {
    startServer: () => Promise<void>;
    stopServer: () => Promise<void>;
}
