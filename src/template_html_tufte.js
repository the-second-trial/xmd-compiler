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
    const renderedLevel = levels[Math.min(level + 1, levels.length)];
    const tagname = `h${renderedLevel}`;
    return [
        `<${tagname}>`,
        text,
        `</${tagname}>`,
    ].join("");
}

module.exports.TEMPLATE = {
    rootWriter: writeRoot,
    headingWriter: writeHeading,
};
