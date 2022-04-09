import { AST_NODE_TYPES } from "./constants.js";

/**
 * Renders the root of the document.
 * @param {string} content The content in the root.
 * @returns {string} The rendered node.
 */
function writeRoot(content) {
    return [
        "<body>",
        "<article>",
        content,
        "</article>",
        "</body>",
    ].join("");
}

/**
 * Renders a heading.
 * @param {string} text The text in the heading.
 * @param {number} level The level: 1-6.
 * @returns {string} The rendered heading.
 */
function writeHeading(text, level) {
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    const tagname = levels[Math.min(level + 1, levels.length)];
    return [
        `<${tagname}>`,
        text,
        `</${tagname}>`,
    ].join("");
}

/**
 * Renders a heading.
 * @param {object[]} elements The array of paragraph elements.
 * @returns {string} The rendered paragraph.
 */
function writeParagraph(elements) {
    const inlineElementRenderers = {
        [AST_NODE_TYPES.PAR_TEXT]: v => v,
        [AST_NODE_TYPES.PAR_ITALIC]: v => `<em>${v}</em>`,
        [AST_NODE_TYPES.PAR_BOLD]: v => `<strong>${v}</strong>`,
        [AST_NODE_TYPES.PAR_CODEINLINE]: v => `<code>${v}</code>`,
    };

    const content = elements
        .map(inlineElement => {
            const inlineRenderer = inlineElementRenderers[inlineElement.t];
            if (!inlineRenderer) {
                throw new Error(`Unrecognized par element type '${inlineElement.t}'`);
            }
            return inlineRenderer(inlineElement.v);
        })
        .join("");
    
        return `<p>${content}</p>`;
}

/**
 * Renders a heading.
 * @param {string} text The text in the code.
 * @returns {string} The rendered code block.
 */
function writeCodeblock(text) {
    return [
        "<pre>",
        "<code>",
        text,
        `</code>`,
        `</pre>`,
    ].join("");
}

export const TEMPLATE = {
    rootWriter: writeRoot,
    headingWriter: writeHeading,
    paragraphWriter: writeParagraph,
    codeblockWriter: writeCodeblock,
};
