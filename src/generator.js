const AST_NODE_TYPES = require("./constants").AST_NODE_TYPES;

/**
 * Generates the final code.
 * @param {any} ast The AST to transform.
 *     Generic form:
 *     {
 *         "t": "start",
 *         "v": [...],
 *     }
 * @returns {string} The output code.
 */
function generate(ast) {
    if (!ast || ast.length === 0) {
        throw new Error("AST cannot be null, undefined or empty");
    }

    if (!checkAst(ast)) {
        throw new Error("Malformed AST");
    }

    return generateStart(ast);
}

function generateStart(node) {
    return node.v
        .map(rootNode => (getRootNodeGeneratorFunction(rootNode.t))(rootNode))
        .reduce((a, b) => `${a}${b}`, "");
}

function generateHeading(node) {
    return "";
}

function generateParagraph(node) {
    return "";
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
