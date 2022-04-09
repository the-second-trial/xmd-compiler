import { AST_NODE_TYPES } from "./constants";

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
 *   codeblockWriter: (text: string) => string,
 * } template The template to use.
 * @returns {string} The output code.
 */
export function generate(ast: any, template: any): any {
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
function generateStart(node: any, template: any): any {
    const flow = node.v
        .map((rootNode: any) => (getRootNodeGeneratorFunction(rootNode.t))(rootNode, template))
        .reduce((a: any, b: any) => `${a}${b}`, "");
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
function generateHeading(node: any, template: any): any {
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
 *         }
 *     }
 *  }
 */
function generateParagraph(node: any, template: any): any {
    return template.paragraphWriter(node.v.v);
}

/**
 * Expected node format:
 * {
 *     "t": "codeblock",
 *     "v": <string>
 *     }
 *  }
 */
 function generateCodeblock(node: any, template: any): any {
    const text = node.v;
    return template.codeblockWriter(text);
}

function getRootNodeGeneratorFunction(type: any): any {
    switch (type) {
        case AST_NODE_TYPES.HEADING:
            return generateHeading;
        case AST_NODE_TYPES.PARAGRAPH:
            return generateParagraph;
        case AST_NODE_TYPES.CODEBLOCK:
            return generateCodeblock;
        default:
            throw new Error(`Unrecognized node type'${type}'`);
    }
}

function checkAst(ast: any): boolean {
    if (!ast.t || ast.t !== AST_NODE_TYPES.START) {
        return false;
    }

    if (!ast.v || typeof ast.v !== "object" || ast.v.length <= 0) {
        return false;
    }

    return true;
}
