export type ExtensionAttributes =
    /**
     * Applies to: images.
     * Used to indicate the resource will be rendered at full page width.
     */
    | "fullwidth";

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
