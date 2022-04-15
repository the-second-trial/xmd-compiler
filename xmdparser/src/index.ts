/**
 * Entry point.
 */

import * as args from "command-line-args";
import { join, basename, dirname, resolve } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { exit } from "process";

import { XmdParser } from "./parser";
import { Generator } from "./generator";
import { HtmlTufteTemplate, HtmlTufteTemplateOptions } from "./template_html_tufte";
import { PythonCodeServer } from "./py_srv";

const current_path = __dirname;

// Configure the commandline args
let { verbose, noserver, src, output, overwrite } = args([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "noserver", alias: "n", type: Boolean },
    // Path to the XMD/MD file
    { name: "src", type: String, defaultOption: true },
    // Path to directory
    { name: "output", alias: "t", type: Number },
    { name: "overwrite", alias: "w", type: Boolean },
]);

// Handle defaults
src = resolve(src || join(current_path, "index.md"));
verbose = verbose || false;
noserver = noserver || false;
output = output || join(dirname(src), basename(src, ".md") + "_html");
overwrite = overwrite === undefined ? false : overwrite

async function main(): Promise<void> {
    console.info(`Compiling: ${src} => ${output}`, "...");

    // Fetch input file content
    if (!existsSync(src)) {
        throw new Error(`Input file '${src}' could not be found`);
    }

    if (existsSync(output)) {
        if (!overwrite) {
            throw new Error(`Location '${output}' exists already`);
        }
        rmSync(output, { recursive: true, force: true });
    }
    mkdirSync(output);
    
    const source = readFileSync(src).toString();
    console.info("Len:", source.length, "processing", "...");
    
    // Parse
    const ast = new XmdParser().parse(source);
    if (verbose) {
        console.log("AST:", JSON.stringify(ast));
    }

    // Launch and wait for the Py Srv to be online
    // Remember that code evaluation happens at generation time, not parse time
    const path2srv = noserver ? undefined : join(current_path, "pysrv", "main.py");
    const pysrv = new PythonCodeServer(path2srv);
    if (!noserver) {
        await pysrv.startServer();
    }

    try {
        // Generate
        const genOptions: HtmlTufteTemplateOptions = {
            outputPath: output,
            inputPath: dirname(src),
        };
        const out = await (
            new Generator(
                new HtmlTufteTemplate(genOptions), pysrv
            )
        ).generate(ast);

        writeFileSync(join(output, "index.html"), out);
        console.info("Output saved into:", output);
    } catch (error) {
        console.error("An error occurred while generating the output code.", error);
    } finally {
        // Kill server
        const srvLog = await pysrv.stopServer();

        console.log("Code server logs");
        console.log(srvLog);
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

