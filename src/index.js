/**
 * Entry point.
 */

const args = require("command-line-args");
const { join, basename, dirname } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { execFile } = require('child_process');

const { parse } = require("./parser");
const { generate } = require("./generator");
const { TEMPLATE } = require("./template_html_tufte");

// Configure the commandline args
let { verbose, src, output } = args([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "src", type: String, defaultOption: true },
    { name: "output", alias: "t", type: Number },
]);

// Handle defaults
src = src || join(__dirname, "index.md");
verbose = verbose || false;
output = output || join(dirname(src), basename(src, ".md") + ".html");

console.info(`Compiling: ${src} => ${output}`, "...");

// Fetch input file content
if (!existsSync(src)) {
    throw new Error(`Input file '${src}' could not be found`);
}

const source = readFileSync(src).toString();
console.info("Len:", source.length, "processing", "...");

// Process
const ast = parse(source);
if (verbose) {
    console.log("AST:", JSON.stringify(ast));
}

// Generate
const out = generate(ast, TEMPLATE);

writeFileSync(output, out);
console.info("Output saved into:", output);
