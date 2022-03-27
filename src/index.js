/**
 * Entry point.
 */

const args = require("command-line-args");
const path = require("path");
const fs = require("fs");

const parser = require("./parser");
const { generate } = require("./generator");

// Configure the commandline args
let { verbose, src, output } = args([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "src", type: String, defaultOption: true },
    { name: "output", alias: "t", type: Number },
]);

// Handle defaults
src = src || path.join(__dirname, "index.md");
verbose = verbose || false;
output = output || path.join(path.dirname(src), path.basename(src, ".md") + ".html");

console.info(`Compiling: ${src} => ${output}`, "...");

// Fetch input file content
if (!fs.existsSync(src)) {
    throw new Error(`Input file '${src}' could not be found`);
}

const source = fs.readFileSync(src).toString();
console.info("Len:", source.length, "processing", "...");

// Process
const ast = parser.parse(source);
if (verbose) {
    console.log("AST:", JSON.stringify(ast));
}

// Generate
const out = generate(ast);

fs.writeFileSync(output, out);
console.info("Output saved into:", output);
