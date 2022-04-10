import { readFileSync } from "fs";
import { join, resolve } from "path";
import * as pegjs from "pegjs";

import { XmdAst } from "./ast";

/**
 * Parses an input and returns the result.
 * @param {string} input The input to parse.
 * @returns {any} The result AST object.
 */
export function parse(input: any): any {
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

/** The Xmd parser. */
export class XmdParser {
    private _parser: pegjs.Parser;

    constructor() {
    }

    public parse(input: string): XmdAst {
        return this.parser.parse(input);
    }

    private get parser(): pegjs.Parser {
        if (!this._parser) {
            this._parser = XmdParser.generateParser();
        }

        return this._parser;
    }

    private static generateParser(): pegjs.Parser {
        const grammar = readFileSync(
            join(
                resolve(),
                "src",
                "grammar",
                "xmd-grammar.pegjs"
            )
        )
        .toString();
        
        return pegjs.generate(grammar);
    }
}
