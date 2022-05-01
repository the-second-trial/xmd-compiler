import { AstExtensionClauseNode, AstExtensionStringNode } from "./ast";
import { Constants } from "./constants";
import { logDebug } from "./debugging";

interface Abbrevation {
    [name: string]: string;
}

/**
 * Handles directives in a document.
 * A directive is an exrtension commasnd at the root of the document.
 */
export class DirectivesController {
    private abbrevations: Abbrevation;

    constructor() {
        this.abbrevations = {};
    }

    /**
     * Executes a directive.
     * @param directive The directive.
     * @param inline A value indicating whether the directive is inline.
     * @returns Nothing or a value.
     */
    public processDirective(directive: AstExtensionStringNode, inline = false): void | string {
        if (!this.checkDirective(directive)) {
            throw new Error("Directive check failed");
        }

        const directiveName = directive.v[0].v.name;
        let result = undefined;
        switch (directiveName) {
            case Constants.Directives.ABBREVATION:
                if (inline) {
                    result = this.retrieveAbbreviationValue(directive.v[0]);
                } else {
                    this.handleAbbreviationDefinition(directive.v[0]);
                }
                break;
            default:
                throw new Error(`Unknown directive '${directiveName}'`);
        }

        return result;
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
