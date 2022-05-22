import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

import { AstExtensionClauseNode, AstExtensionStringNode } from "./ast";
import { Constants } from "./constants";
import { logDebug } from "./debugging";
import { Generator } from "./generator";
import { XmdParser } from "./parser";

interface Def {
    [name: string]: string;
}

/**
 * Handles references.
 */
export class DefinitionsDirectivesController {
    private defs: Def;

    /** Initializes a new instance of this class. */
     constructor() {
        this.defs = {};
    }

    /**
     * Executes a directive.
     * @param directive The directive.
     * @param inline A value indicating whether the directive is inline.
     * @returns Nothing or a value.
     */
    public processDirective(
        directive: AstExtensionStringNode,
        inline: boolean
    ): void | string {
        if (!this.checkDirective(directive)) {
            throw new Error("Directive check failed");
        }

        const directiveClause = directive.v[0];
        const directiveName = directiveClause.v.name;
        let result = undefined;
        switch (directiveName) {
            case Constants.Directives.DEFINITION:
                if (inline) {
                    result = this.retrieveDefValue(directiveClause);
                } else {
                    this.handleDefDefinition(directiveClause);
                }
                break;
            default:
                throw new Error(`Unknown directive '${directiveName}'`);
        }

        return result;
    }

    /**
     * Retrieves, if found, the value of a def.
     * @param name The name to look for.
     * @returns The value of the def or null.
     *     Null is returned in order to differentiate explicitely from
     *     undefined in case of empty string returned.
     */
    public getDef(name: string): string | null {
        const candidate = this.defs[name];

        if (candidate === undefined) {
            return null;
        }

        if (candidate.length === 0) {
            return "";
        }

        return candidate;
    }

    private checkDirective(directive: AstExtensionStringNode): boolean {
        return directive.v.length === 1;
    }

    private retrieveDefValue(defRef: AstExtensionClauseNode): string {
        const referenceName = defRef.v.value;
        if (!referenceName || referenceName.length <= 0) {
            throw new Error("Definition reference cannot be empty, null or undefined");
        }

        const value = this.defs[referenceName];
        if (!value) {
            logDebug(`Error: could not find definition reference '${referenceName}'`);
        }

        return value;
    }

    private handleDefDefinition(defDefinition: AstExtensionClauseNode): void {
        const def = defDefinition.v.value;

        if (!def) {
            throw new Error("Definition cannot be empty, null or undefined");
        }

        const regex = /([^:]+):?(.*)/;
        const matches = def.match(regex);
        if (matches.length !== 2 && matches.length !== 3) {
            throw new Error(`Invalid definition '${def}'`);
        }

        const defName = matches[1];
        const defValue = matches[2] || "";
        if (!defName || defName.length <= 0) {
            throw new Error(`Definition '${def}' is malformed`);
        }

        logDebug(`Defined new definition: ${defName}='${defValue}'`);

        this.defs[defName] = defValue;
    }
}

/**
 * Handles directives in a document.
 * A directive is an exrtension commasnd at the root of the document.
 */
export class DirectivesController {
    private definitionsController: DefinitionsDirectivesController;
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
        this.definitionsController = new DefinitionsDirectivesController();
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
                result = await this.handleImport(directiveClause);
                break;
            case Constants.Directives.LANG:
                result = this.handleLangDefinition(directiveClause);
                break;
            case Constants.Directives.DEFINITION:
                result = this.definitionsController.processDirective(directive, inline);
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

    private checkDirective(directive: AstExtensionStringNode): boolean {
        return directive.v.length === 1;
    }
}
