import { ImageExtensionAttributes } from "./extensions/extensions";
import { DocumentInfo } from "./semantics";

/** Describes a template for generating an output code. */
export interface DirectFlowRenderer {
    /** Gets the output directory path. */
    outputDirPath: string;

    /**
     * Writes the output to a file.
     * @param output The output to save.
     * @returns The path to the location where the file has been saved.
     */
    writeToFile: (output: string) => string;

    /**
     * Renders the root of the document.
     * @param content The content in the root.
     * @param docInfo The document info.
     * @returns The rendered node.
     */
    writeRoot: (content: string, docInfo: DocumentInfo) => string;

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
     * Renders a paragraph inline equation text.
     * @param equation The equation to render.
     * @returns The rendered paragraph text.
     */
    writeParagraphEquationInlineText: (equation: string) => string;

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

    /**
     * Renders an equation block.
     * @param text The equation.
     * @returns The rendered equation block.
     */
    writeEquationblock: (equation: string) => string;

    /**
     * Renders an image.
     * @param alt The alt text of the image.
     * @param path The path to the image.
     * @param title The title.
     * @param ext The extensions.
     * @returns The rendered equation block.
     */
    writeImage: (alt: string, path: string, title?: string, ext?: ImageExtensionAttributes) => string;

    /**
     * Renders an HRule.
     */
    writeHRule: () => string;
}