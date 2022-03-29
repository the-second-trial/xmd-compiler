const AST_NODE_TYPES = require("./constants").AST_NODE_TYPES;

/**
 * Generates the final code.
 * @param {any} ast The AST to transform.
 *     Generic form:
 *     {
 *         "t": "start",
 *         "v": [...],
 *     }
 * @param {
 *   rootWriter: (content: string) => string,
 *   headingWriter: (text: string, level: number) => string,
 *   paragraphWriter: (elements: object[]) => string,
 * } template The template to use.
 * @returns {string} The output code.
 */
function generate(ast, template) {
    if (!ast || ast.length === 0) {
        throw new Error("AST cannot be null, undefined or empty");
    }

    if (!template) {
        throw new Error("Missing template");
    }

    if (!checkAst(ast)) {
        throw new Error("Malformed AST");
    }

    return generateStart(ast, template);
}

/**
 * Expected node format:
 * {
 *     "t": "start",
 *     "v": <object[]>,
 * }
 */
function generateStart(node, template) {
    const flow = node.v
        .map(rootNode => (getRootNodeGeneratorFunction(rootNode.t))(rootNode, template))
        .reduce((a, b) => `${a}${b}`, "");
    return template.rootWriter(flow);
}

/**
 * Expected node format:
 * {
 *     "t": "heading",
 *     "v": {
 *         "t": "heading_text",
 *         "v": <string>,
 *         "p": {
 *             "type": <number>
 *         }
 *     }
 * }
 */
function generateHeading(node, template) {
    const text = node.v.v;
    const level = node.v.p.type;
    return template.headingWriter(text, level);
}

/**
 * Expected node format:
 * {
 *     "t": "paragraph",
 *     "v": {
 *         "t": "par",
 *         "v": [
 *             {
 *                 "t": "text",
 *                 "v": <string>
 *             }
 *         ]
 *     }
 *  }
 */
function generateParagraph(node, template) {
    return template.paragraphWriter(node.v.v);
}

function getRootNodeGeneratorFunction(type) {
    switch (type) {
        case AST_NODE_TYPES.HEADING:
            return generateHeading;
        case AST_NODE_TYPES.PARAGRAPH:
            return generateParagraph;
        default:
            throw new Error(`Unrecognized node type'${type}'`);
    }
}

function checkAst(ast) {
    if (!ast.t || ast.t !== AST_NODE_TYPES.START) {
        return false;
    }

    if (!ast.v || typeof ast.v !== "object" || ast.v.length <= 0) {
        return false;
    }

    return true;
}

module.exports.generate = generate;
