/**
 * Entry point.
 */

import * as args from "command-line-args";
import { join, basename, dirname, resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { execFile } from "child_process";
import fetch from "node-fetch";
import { exit } from "process";

import { parse } from "./parser";
import { generate } from "./generator";
import { TEMPLATE } from "./template_html_tufte";
import { SRV_PING_MAX_ATTEMPTS_COUNT, SRV_PING_WAIT_RETRY_MS } from "./constants";

async function startServer(curpath: string) {
    const srvpath = join(curpath, "pysrv", "main.py");
    const srv = execFile("python", [srvpath]);

    // Poll until the server is online
    for (let i = SRV_PING_MAX_ATTEMPTS_COUNT; i > 0; i--) {
        try {
            const res = await fetch("http://localhost:8080/ping");
            const body = await res.json() as any;
            if (body["result"] === "ok" && body["reply"] === "pong") {
                console.log("Connection successfully established :)");
                return Promise.resolve(srv);
            }
        } catch (error) {
            // Swallow
        }

        console.log("Retrying...");
        await new Promise(resolve => setTimeout(resolve, SRV_PING_WAIT_RETRY_MS));
    }

    console.error("Max attempts reached");
    return Promise.reject(new Error("Max attempts reached"));
}

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

console.info(`Compiling: ${src} => ${output}`, "...");

// Fetch input file content
if (!existsSync(src)) {
    throw new Error(`Input file '${src}' could not be found`);
}

const source = readFileSync(src).toString();
console.info("Len:", source.length, "processing", "...");

// Launch and wait for the Py Srv to be online
startServer(current_path)
    .then(srv => {
        // Process
        const ast = parse(source);
        if (verbose) {
            console.log("AST:", JSON.stringify(ast));
        }

        // Generate
        const out = generate(ast, TEMPLATE);

        // Kill server
        srv.kill();

        writeFileSync(output, out);
        console.info("Output saved into:", output);
    })
    .catch(error => {
        console.error("Error", error);
        exit(1);
    });
