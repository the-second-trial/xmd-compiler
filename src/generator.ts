import { XmdAst } from "./ast";
import { AST_NODE_TYPES } from "./constants";
import { Template } from "./template";

/** A component capable of rendering the final code. */
export class Generator {
    constructor(private template: Template) {
    }

    /**
     * Generates the output code.
     * @param ast The input AST.
     */
    public generate(ast: XmdAst): string {
        if (!ast || ast.t !== "start") {
            throw new Error("AST cannot be null, undefined or malformed");
        }
    
        if (!Generator.checkAst(ast)) {
            throw new Error("Malformed AST");
        }
    
        return this.generateStart(ast);
    }
    
    private generateStart(node: any): any {
        const flow = node.v
            .map((rootNode: any) => (this.getRootNodeGeneratorFunction(rootNode.t))(rootNode, this.template))
            .reduce((a: any, b: any) => `${a}${b}`, "");
        return this.template.writeRoot(flow);
    }

    private generateHeading(node: any): any {
        const text = node.v.v;
        const level = node.v.p.type;
        return this.template.writeHeading(text, level);
    }

    private generateParagraph(node: any): any {
        return this.template.writeParagraph(node.v.v);
    }

    private generateCodeblock(node: any): any {
        const text = node.v;
        return this.template.writeCodeblock(text);
    }

    private getRootNodeGeneratorFunction(type: any): any {
        switch (type) {
            case AST_NODE_TYPES.HEADING:
                return this.generateHeading;
            case AST_NODE_TYPES.PARAGRAPH:
                return this.generateParagraph;
            case AST_NODE_TYPES.CODEBLOCK:
                return this.generateCodeblock;
            default:
                throw new Error(`Unrecognized node type'${type}'`);
        }
    }

    private static checkAst(ast: any): boolean {
        if (!ast.t || ast.t !== AST_NODE_TYPES.START) {
            return false;
        }
    
        if (!ast.v || typeof ast.v !== "object" || ast.v.length <= 0) {
            return false;
        }
    
        return true;
    }
}

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
