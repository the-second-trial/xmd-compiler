import { readFileSync } from "fs";
import { join, resolve } from "path";
import pegjs from "pegjs";

/**
 * Parses an input and returns the result.
 * @param {string} input The input to parse.
 * @returns {any} The result AST object.
 */
export function parse(input) {
    const grammar = readFileSync(
        join(
            resolve(),
            "src",
            "grammar",
            "xmd-grammar.pegjs"
        )
    )
    .toString();
    
    const parser = pegjs.generate(grammar);
    return parser.parse(input);
}
