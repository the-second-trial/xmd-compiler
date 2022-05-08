import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { AstExtensionClauseNode, AstExtensionStringNode } from "./ast";
import { Constants } from "./constants";
import { logDebug } from "./debugging";
import { Generator } from "./generator";
import { XmdParser } from "./parser";

interface Abbrevation {
    [name: string]: string;
}

/**
 * Handles directives in a document.
 * A directive is an exrtension commasnd at the root of the document.
 */
export class DirectivesController {
    private abbrevations: Abbrevation;
    private _lang: string;

    /**
     * Initializes a new instance of this class.
     * @param srcDirPath The path to the directory containing the master file.
     * @param generator The generator to use when processing import directives.
     */
    constructor(
        private srcDirPath: string,
        private generator: Generator
    ) {
        this.abbrevations = {};
    }

    /**
     * Executes a directive.
     * @param directive The directive.
     * @param inline A value indicating whether the directive is inline.
     * @returns Nothing or a value.
     */
    public async processDirective(
        directive: AstExtensionStringNode,
        inline = false
    ): Promise<void | string> {
        if (!this.checkDirective(directive)) {
            throw new Error("Directive check failed");
        }

        const directiveClause = directive.v[0];
        const directiveName = directiveClause.v.name;
        let result = undefined;
        switch (directiveName) {
            case Constants.Directives.IMPORT:
                result = this.handleImport(directiveClause);
                break;
            case Constants.Directives.LANG:
                result = this.handleLangDefinition(directiveClause);
                break;
            case Constants.Directives.ABBREVATION:
                if (inline) {
                    result = this.retrieveAbbreviationValue(directiveClause);
                } else {
                    this.handleAbbreviationDefinition(directiveClause);
                }
                break;
            default:
                throw new Error(`Unknown directive '${directiveName}'`);
        }

        return result;
    }

    /** Gets the language definition retrieved before while scanning. */
    public get lang(): string {
        return this._lang;
    }

    private handleLangDefinition(langDefinition: AstExtensionClauseNode): void {
        const langValue = langDefinition.v.value;
        if (!langValue || langValue.length <= 0) {
            throw new Error("Lang definition cannot be empty, null or undefined");
        }

        this._lang = langValue;
    }

    private async handleImport(importDefinition: AstExtensionClauseNode): Promise<string> {
        const fileName = importDefinition.v.value;
        if (!fileName || fileName.length <= 0) {
            throw new Error("Import file name cannot be empty, null or undefined");
        }

        const filePath = resolve(this.srcDirPath, fileName);
        if (!existsSync(filePath)) {
            throw new Error(`File '${filePath}' could not be found, failed to import`);
        }

        const source = readFileSync(filePath).toString();

        // Parse
        const ast = new XmdParser().parse(source);

        // Generate
        const out = await this.generator.generate(ast);

        return out;
    }

    private retrieveAbbreviationValue(abbreviationRef: AstExtensionClauseNode): string {
        const referenceName = abbreviationRef.v.value;
        if (!referenceName || referenceName.length <= 0) {
            throw new Error("Abbreviation reference cannot be empty, null or undefined");
        }

        const value = this.abbrevations[referenceName];
        if (!value) {
            logDebug(`Error: could not find abbreviation reference '${referenceName}'`);
        }

        return value;
    }

    private handleAbbreviationDefinition(abbreviationDefinition: AstExtensionClauseNode): void {
        const abbreviation = abbreviationDefinition.v.value;

        if (!abbreviation) {
            throw new Error("Abbreviation cannot be empty, null or undefined");
        }

        const regex = /([^:]+):(.+)/;
        const matches = abbreviation.match(regex);
        if (matches.length !== 3) {
            throw new Error(`Invalid abbreviation '${abbreviation}'`);
        }

        const abbrName = matches[1];
        const abbrValue = matches[2];
        if (!abbrName || !abbrValue || abbrName.length <= 0 || abbrValue.length <= 0) {
            throw new Error(`Abbreviation '${abbreviation}' is malformed`);
        }

        logDebug(`Defined new abbreviation: ${abbrName}='${abbrValue}'`);

        this.abbrevations[abbrName] = abbrValue;
    }

    private checkDirective(directive: AstExtensionStringNode): boolean {
        return directive.v.length === 1;
    }
}
