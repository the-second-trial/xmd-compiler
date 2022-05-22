import { AstExtensionClauseNode } from "../ast";

export type ExtensionAttributes =
    /**
     * Applies to: images.
     * Used to indicate the resource will be rendered at full page width.
     */
    | "fullwidth"
    /**
     * Applies to: heading.
     * Environment "Theorem".
     */
    | "theorem"
    /**
     * Applies to: heading.
     * Used to control conditional content.
     */
     | "if";

export type ImageExtensionAttributes = Pick<Record<ExtensionAttributes, string>, "fullwidth">;

export type HeadingExtensionAttributes = Pick<Record<ExtensionAttributes, string>, "theorem">;

export type IfExtensionAttributes = Pick<Record<ExtensionAttributes, string>, "if">;

export type ExtensionValues = Record<ExtensionAttributes, string>;

/** Handles extensions in XMD syntax. */
export class ExtensionsManager {
    /**
     * Parses a string with extensions: "name=value,name=value,...".
     * @param input 
     * @returns 
     */
    public parse(input: string): {
        result: Partial<ExtensionValues>,
        unknown: { [k: string]: string }
    } {
        const clauses = input.split(ExtensionsManager.separator);
        const parsed_clauses: { [k: string]: string } = {};
        clauses.forEach(clause => {
            const trimmed = clause.trim();
            if (trimmed.indexOf(ExtensionsManager.assignment) < 0) {
                parsed_clauses[trimmed] = "true";
                return;
            }
            const pair = trimmed.split(ExtensionsManager.assignment);
            parsed_clauses[pair[0]] = pair[1];
        });

        return {
            result: {
                fullwidth: parsed_clauses["fullwidth"],
                theorem: parsed_clauses["theorem"],
                if: parsed_clauses["if"],
            },
            unknown: {},
        };
    }

    public static get separator(): string {
        return ",";
    }

    public static get assignment(): string {
        return "=";
    }
}

export function stringifyExtensionCluasesArray(clauses?: Array<AstExtensionClauseNode>) {
    return (clauses || [])
        .map(x => `${x.v.name}=${x.v.value || "true"}`)
        .join(",")
}
