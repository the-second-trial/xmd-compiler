const fs = require("fs");
const path = require("path");
const pegjs = require("pegjs");

/**
 * Parses an input and returns the result.
 * @param {string} input The input to parse.
 * @returns {any} The result AST object.
 */
function parse(input) {
    const grammar = fs.readFileSync(
        path.join(
            __dirname,
            "grammar",
            "xmd-grammar.pegjs"
        )
    )
    .toString();
    
    const parser = pegjs.generate(grammar);
    return parser.parse(input);
}

module.exports.parse = parse;
