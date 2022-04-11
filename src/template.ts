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
     * Renders a paragraph.
     * @param text The content to render.
     * @returns The rendered paragraph.
     */
    writeParagraph: (content: string) => string;
    
    /**
     * Renders a paragraph text.
     * @param text The text to render.
     * @returns The rendered paragraph text.
     */
    writeParagraphText: (text: string) => string;

    /**
     * Renders a paragraph bold text.
     * @param text The text to render.
     * @returns The rendered paragraph text.
     */
    writeParagraphBoldText: (text: string) => string;

     /**
     * Renders a paragraph italic text.
     * @param text The text to render.
     * @returns The rendered paragraph text.
     */
    writeParagraphItalicText: (text: string) => string;

    /**
     * Renders a paragraph code inline.
     * @param text The text in the code.
     * @param evalResult The result of the evaluation.
     * @returns The rendered paragraph code inline.
     */
    writeParagraphCodeInline: (text: string, evalResult?: string) => string;

    /**
     * Renders a codeblock.
     * @param text The text in the code.
     * @param evalResult The result of the evaluation.
     * @returns The rendered code block.
     */
    writeCodeblock: (text: string, evalResult?: string) => string;
}
