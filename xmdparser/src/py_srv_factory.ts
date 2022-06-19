import { CodeServer } from "./code_srv";
import { LocalPythonCodeServer, RemotePythonCodeServer } from "./py_srv";

export class PythonCodeServerFactory {
    /**
     * Initializes a new instance of this class.
     * @param platformTarget The targeted platform.
     */
     constructor(
        private platformTarget: "local" | "remote",
        private path?: string
    ) {
    }

    public create(): CodeServer {
        if (this.platformTarget === "remote") {
            return new RemotePythonCodeServer();
        }

        if (!this.path) {
            throw new Error("A local Python server requires a path");
        }
        
        return new LocalPythonCodeServer(this.path);
    }
}