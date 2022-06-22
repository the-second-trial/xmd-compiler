import { XmdParser } from "../xmdparser/src/parser";
import { PythonCodeServerFactory } from "../xmdparser/src/py_srv_factory";
import { CodeServer } from "../xmdparser/src/code_srv";
import { RemoteGeneratorFactory } from "./remote_generator_factory";
import { JsonPayload } from "../xmdparser/src/resource_image";
import { RemoteSerializer } from "./remote_serializer";

export interface ParseRequest {
    source: string;
    inputImage: JsonPayload;
}

export interface ParseResponse {
    outputImage: JsonPayload;
}

/** Controller for parsing. */
export class ParserController {
    private pysrv: CodeServer;

    constructor() {
        this.pysrv = new PythonCodeServerFactory("remote").create();
    }

    public async initialize(): Promise<void> {
        // Will actually result in nothing to be done
        await this.pysrv.startServer();
    }

    public async dispose(): Promise<void> {
        // Will actually result in nothing to be done
        const srvLog = await this.pysrv.stopServer();
    }

    /**
     * Handles a request for parsing a package.
     * @param req The request.
     */
    public async parse(req: ParseRequest): Promise<ParseResponse | string> {    
        // Parse
        const ast = new XmdParser().parse(req.source);
    
        const generator = new RemoteGeneratorFactory(this.pysrv).create();
    
        try {
            // Generate
            const out = await generator.generate(ast);
        } catch (error) {
            console.error("An error occurred while generating the output code.", error);
        }

        const outputImage = new RemoteSerializer(generator.output).serialize();

        return {
            outputImage,
        };
    }
}
