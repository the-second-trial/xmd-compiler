import * as pegjs from "pegjs";

import { XmdAst } from "./ast";
import { ProgressController } from "./progress_controller";
import pegjsgrammar from "./grammar/xmd-grammar.pegjs";

/** The Xmd parser. */
export class XmdParser {
    private _parser: pegjs.Parser;

    constructor() {
    }

    public parse(input: string): XmdAst {
        const result = this.parser.parse(input);

        ProgressController.instance.updateStateOfParse(100);

        return result;
    }

    private get parser(): pegjs.Parser {
        if (!this._parser) {
            this._parser = XmdParser.generateParser();
        }

        return this._parser;
    }

    private static generateParser(): pegjs.Parser {
        const grammar = pegjsgrammar;
        
        const parser = pegjs.generate(grammar);

        ProgressController.instance.updateStateOfParse(50);

        return parser;
    }
}
