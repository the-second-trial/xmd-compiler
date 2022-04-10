import { XmdAst } from "./ast";
import { Constants } from "./constants";
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
            .map((rootNode: any) => {
                switch (rootNode.t) {
                    case Constants.NodeTypes.HEADING:
                        return this.generateHeading(rootNode);
                    case Constants.NodeTypes.PARAGRAPH:
                        return this.generateParagraph(rootNode);
                    case Constants.NodeTypes.CODEBLOCK:
                        return this.generateCodeblock(rootNode);
                    default:
                        throw new Error(`Unrecognized node type'${rootNode.t}'`);
                }
            })
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

    private static checkAst(ast: any): boolean {
        if (!ast.t || ast.t !== Constants.NodeTypes.START) {
            return false;
        }
    
        if (!ast.v || typeof ast.v !== "object" || ast.v.length <= 0) {
            return false;
        }
    
        return true;
    }
}
