import { XmdParser } from "../xmdparser/src/parser";
import { GeneratorFactory } from "../xmdparser/src/generator_factory";
import { ProgressController, VoidProgressController } from "../xmdparser/src/progress_controller";
import { DebugController, logDebug } from "../xmdparser/src/debugging";
import { PythonCodeServerFactory } from "../xmdparser/src/py_srv_factory";
import { Config } from "../xmdparser/src/config";

export interface ParseRequest {
    src: string;
}

export interface ParseResponse {
    
}

/** Controller for parsing. */
export class ParserController {
    public async parse(req: ParseRequest): Promise<ParseResponse> {
        const config: Config = {
            debug: false,
            src: "",
            template: "",
        };
    
        ProgressController.set(new VoidProgressController());
        
        // Parse
        const ast = new XmdParser().parse(req.src);
        DebugController.instance.ast = JSON.stringify(ast);
    
        const pysrv = new PythonCodeServerFactory("remote").create();
    
        const generator = new GeneratorFactory(config, pysrv, "remote").create();
    
        try {
            // Generate
            const out = await generator.generate(ast);
    
            logDebug(`Output saved into: '${config.output}'`);
        } catch (error) {
            console.error("An error occurred while generating the output code.", error);
        } finally {
            // Here so we have the output image filled
            const outputImage = generator.output;
    
            // Add debugging info
            if (config.debug) {
                DebugController.instance.save(outputImage);
            }
    
            // Serialize the image
            generator.output.serialize();
        }
    }
}
