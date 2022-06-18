/**
 * Entry point.
 */

import { join, dirname, resolve, basename } from "path";
import { existsSync, readFileSync } from "fs";
import { exit } from "process";

import { XmdParser } from "./parser";
import { Constants } from "./constants";
import { GeneratorFactory } from "./generator_factory";
import { ProgressController } from "./progress_controller";
import { printGenInfo } from "./print";
import { truncate } from "./utils";
import { DebugController, logDebug } from "./debugging";
import { getConfigFromCommandLineArgs } from "./config";
import { PythonCodeServerFactory } from "./py_srv_factory";
import { serializeResourceImageToFileSystem } from "./resource_image";

const current_path = __dirname;

// Configure the commandline args
const config = getConfigFromCommandLineArgs(process.argv);

// Handle defaults
config.src = resolve(config.src || join(current_path, "index.md"));
config.output = resolve(config.output || dirname(config.src));
config.template = config.template || Constants.OutputTypes.HTML_TUFTE;

async function main(): Promise<void> {
    if (!existsSync(config.src)) {
        throw new Error(`Input file '${config.src}' could not be found`);
    }

    if (!existsSync(config.output)) {
        throw new Error(`Output location '${config.output}' does not exist`);
    }

    console.log(printGenInfo(config.template));

    console.info(`${truncate(config.src)} => ${truncate(config.output)}`);
    
    const source = readFileSync(config.src).toString("utf8");

    ProgressController.instance.initialize();
    
    // Parse
    const ast = new XmdParser().parse(source);
    DebugController.instance.ast = JSON.stringify(ast);

    // Launch and wait for the Py Srv to be online
    // Remember that code evaluation happens at generation time, not parse time
    const path2srv = config.noserver ? undefined : join(current_path, "pysrv", "main.py");
    const pysrv = new PythonCodeServerFactory(config.noserver ? "remote" : "local", path2srv).create();
    await pysrv.startServer();

    const generator = new GeneratorFactory(config, pysrv, "local").create();

    try {
        // Generate
        const out = await generator.generate(ast);

        logDebug(`Output saved into: '${config.output}'`);
    } catch (error) {
        console.error("An error occurred while generating the output code.", error);
    } finally {
        // Add debugging info
        if (config.debug) {
            DebugController.instance.save(generator.output); // TODO: Evaluate using a different image
        }

        // Serialize the image
        const imageName = basename(this.config.src, ".md");
        const outputFolder = join(config.output, `${imageName}_${config.template || "none"}`);
        serializeResourceImageToFileSystem(generator.output, outputFolder);

        // Kill server
        const srvLog = await pysrv.stopServer();
        logDebug(`Code server logs: '${srvLog}'`);

        ProgressController.instance.complete();

        console.log("Done and saved:", config.output);
    }
}

main()
    .then(() => {
        exit(0);
    })
    .catch(error => {
        console.error("An error occurred", error);
        exit(1);
    });
