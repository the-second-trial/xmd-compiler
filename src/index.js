/**
 * Entry point.
 */

const args = require("command-line-args");
const path = require("path");
const fs = require("fs");

const parser = require("./parser");

// Configure the commandline args
let { verbose, src, output } = args([
    { name: "verbose", alias: "v", type: Boolean },
    { name: "src", type: String, defaultOption: true },
    { name: "output", alias: "t", type: Number },
]);

// Handle defaults
src = src || path.join(__dirname, "index.md");
verbose = verbose || false;
output = output || path.join(__dirname, "index.html");

console.info(`Compiling: ${src} => ${output}`, "...");

// Fetch input file content
if (!fs.existsSync(src)) {
    throw new Error(`Input file '${src}' could not be found`);
}

const source = fs.readFileSync(src).toString();
console.info("Len:", source.length, "processing", "...");

// Process
const res = parser.parse(source);

console.log("Result", JSON.stringify(res));
