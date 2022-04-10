/** Describes a template for generating an output code. */
export interface Template {
    /**
     * Renders the root of the document.
     * @param content The content in the root.
     * @returns The rendered node.
     */
    writeRoot: (content: string) => string;

    /**
     * Renders a heading.
     * @param text The text in the heading.
     * @param level The level: 1-6.
     * @returns The rendered heading.
     */
    writeHeading: (text: string, level: number) => string;

    /**
     * Renders a heading.
     * @param elements The array of paragraph elements.
     * @returns The rendered paragraph.
     */
    writeParagraph: (elements: Array<any>) => string;

    /**
     * Renders a heading.
     * @param text The text in the code.
     * @param evalResult The result of the evaluation.
     * @returns The rendered code block.
     */
    writeCodeblock: (text: string, evalResult?: string) => string;
}
