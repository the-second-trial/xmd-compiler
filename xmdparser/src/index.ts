/**
 * Entry point.
 */

import { join, dirname, resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { exit } from "process";

import { XmdParser } from "./parser";
import { PythonCodeServer } from "./py_srv";
import { Constants } from "./constants";
import { GeneratorFactory } from "./generator_factory";
import { ProgressController } from "./progress_controller";
import { printGenInfo } from "./print";
import { truncate } from "./utils";
import { DebugController, logDebug } from "./debugging";
import { getConfigFromCommandLineArgs } from "./config";

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
    
    const source = readFileSync(config.src).toString();

    ProgressController.instance.initialize();
    
    // Parse
    const ast = new XmdParser().parse(source);
    DebugController.instance.ast = JSON.stringify(ast);

    // Launch and wait for the Py Srv to be online
    // Remember that code evaluation happens at generation time, not parse time
    const path2srv = config.noserver ? undefined : join(current_path, "pysrv", "main.py");
    const pysrv = new PythonCodeServer(path2srv);
    if (!config.noserver) {
        await pysrv.startServer();
    }

    let outputPath = "";
    try {
        // Generate
        const generator = new GeneratorFactory(config, pysrv).create();
        outputPath = generator.outputDirPath;

        const out = await generator.generate(ast);

        generator.write(out);
        logDebug(`Output saved into: '${outputPath}'`);
    } catch (error) {
        console.error("An error occurred while generating the output code.", error);
    } finally {
        // Kill server
        const srvLog = await pysrv.stopServer();

        logDebug(`Code server logs: '${srvLog}'`);

        ProgressController.instance.complete();
        DebugController.instance.save(outputPath);

        console.log("Done and saved:", outputPath);
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
