const fs = require("fs");
const path = require("path")
const pegjs = require("pegjs");

const grammar = fs.readFileSync(path.join(__dirname, "grammar.pegjs")).toString();
console.log("Grammar", grammar);

const parser = pegjs.generate(grammar);
const res = parser.parse("2+2");

console.log("Result", JSON.stringify(res));
