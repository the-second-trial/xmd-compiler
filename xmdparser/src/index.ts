/**
 * Entry point.
 */

import * as args from "command-line-args";
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

const current_path = __dirname;

// Configure the commandline args
let { verbose, noserver, src, output, template } = args([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "noserver", alias: "n", type: Boolean },
    // Path to the XMD/MD file
    { name: "src", type: String, defaultOption: true },
    // Path to directory (must exist) where the output directory is going to be created
    { name: "output", alias: "o", type: String },
    { name: "template", alias: "t", type: String },
]);

// Handle defaults
src = resolve(src || join(current_path, "index.md"));
verbose = verbose || false;
noserver = noserver || false;
output = resolve(output || dirname(src));
template = template || Constants.OutputTypes.HTML_TUFTE;

async function main(): Promise<void> {
    if (!existsSync(src)) {
        throw new Error(`Input file '${src}' could not be found`);
    }

    if (!existsSync(output)) {
        throw new Error(`Output location '${output}' does not exist`);
    }

    console.log(printGenInfo(template));

    console.info(`${truncate(src)} => ${truncate(output)}`);
    
    const source = readFileSync(src).toString();

    ProgressController.instance.initialize();
    
    // Parse
    const ast = new XmdParser().parse(source);
    // if (verbose) {
    //     console.log("AST:", JSON.stringify(ast));
    // }

    // Launch and wait for the Py Srv to be online
    // Remember that code evaluation happens at generation time, not parse time
    const path2srv = noserver ? undefined : join(current_path, "pysrv", "main.py");
    const pysrv = new PythonCodeServer(path2srv);
    if (!noserver) {
        await pysrv.startServer();
    }

    try {
        // Generate
        const generator = new GeneratorFactory(template, pysrv, output, src)
            .create();
        const out = await generator.generate(ast);

        const outputPath = generator.write(out);
        //console.info("Output saved into:", outputPath);
    } catch (error) {
        console.error("An error occurred while generating the output code.", error);
    } finally {
        // Kill server
        const srvLog = await pysrv.stopServer();

        // console.log("Code server logs");
        // console.log(srvLog);

        ProgressController.instance.complete();

        console.log("Done");
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

