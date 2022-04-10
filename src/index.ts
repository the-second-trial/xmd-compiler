/**
 * Entry point.
 */

import * as args from "command-line-args";
import { join, basename, dirname, resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { exit } from "process";

import { XmdParser } from "./parser";
import { Generator } from "./generator";
import { HtmlTufteTemplate } from "./template_html_tufte";
import { PythonCodeServer } from "./py_srv";

const current_path = resolve();

// Configure the commandline args
let { verbose, src, output } = args([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "src", type: String, defaultOption: true },
    { name: "output", alias: "t", type: Number },
]);

// Handle defaults
src = src || join(current_path, "index.md");
verbose = verbose || false;
output = output || join(dirname(src), basename(src, ".md") + ".html");

async function main(): Promise<void> {
    console.info(`Compiling: ${src} => ${output}`, "...");

    // Fetch input file content
    if (!existsSync(src)) {
        throw new Error(`Input file '${src}' could not be found`);
    }
    
    const source = readFileSync(src).toString();
    console.info("Len:", source.length, "processing", "...");
    
    // Launch and wait for the Py Srv to be online
    const pysrv = new PythonCodeServer(join(current_path, "pysrv", "main.py"));
    await pysrv.startServer();
    
    // Parse
    const ast = new XmdParser().parse(source);
    if (verbose) {
        console.log("AST:", JSON.stringify(ast));
    }

    // Generate
    const out = new Generator(new HtmlTufteTemplate()).generate(ast);

    // Kill server
    await pysrv.stopServer();

    writeFileSync(output, out);
    console.info("Output saved into:", output);
}

main()
    .then(() => {
        exit(0);
    })
    .catch(error => {
        console.error("An error occurred", error);
        exit(1);
    });

