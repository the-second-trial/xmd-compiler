export type ExtensionAttributes =
    /**
     * Applies to: images.
     * Used to indicate the resource will be rendered at full page width.
     */
    | "fullwidth";

export type ExtensionValues = Record<ExtensionAttributes, string>;

/** Handles extensions in XMD syntax. */
export class ExtensionsManager {
    public parse(input: string): Partial<ExtensionValues> {
        const clauses = input.split(",");
        const parsed_clauses: { [k: string]: string } = {};
        clauses.forEach(clause => {
            const trimmed = clause.trim();
            if (trimmed.indexOf("=") < 0) {
                parsed_clauses[trimmed] = "true";
                return;
            }
            const pair = trimmed.split("=");
            parsed_clauses[pair[0]] = pair[1];
        });

        return {
            fullwidth: parsed_clauses["fullwidth"],
        };
    }
}
