import { AstCodeblockComponentNode, AstComponentNode, XmdAst } from "./ast";
import { CodeChunkEvaluator, EvalResult } from "./code_srv";
import { Constants } from "./constants";
import { Template } from "./template";

/** A component capable of rendering the final code. */
export class Generator {
    constructor(
        private template: Template,
        private codeEvaluator?: CodeChunkEvaluator
    ) {
    }

    /**
     * Generates the output code.
     * @param ast The input AST.
     */
    public async generate(ast: XmdAst): Promise<string> {
        if (!ast || ast.t !== "start") {
            throw new Error("AST cannot be null, undefined or malformed");
        }
    
        if (!Generator.checkAst(ast)) {
            throw new Error("Malformed AST");
        }
    
        return this.generateStart(ast);
    }
    
    private async generateStart(node: XmdAst): Promise<string> {
        const flow = await Promise.all(node.v
            .map((componentNode: AstComponentNode) => {
                switch (componentNode.t) {
                    case Constants.NodeTypes.HEADING:
                        return Promise.resolve(this.generateHeading(componentNode));
                    case Constants.NodeTypes.PARAGRAPH:
                        return Promise.resolve(this.generateParagraph(componentNode));
                    case Constants.NodeTypes.CODEBLOCK:
                        // Inherently async
                        return this.generateCodeblock(componentNode as AstCodeblockComponentNode);
                    default:
                        throw new Error(`Unrecognized node type'${componentNode.t}'`);
                }
            }));
        const reducedFlow = flow.reduce((a: any, b: any) => `${a}${b}`, "");
        return this.template.writeRoot(reducedFlow);
    }

    private generateHeading(node: AstComponentNode): string {
        const text = node.v.v;
        const level = node.v.p.type;
        return this.template.writeHeading(text, level);
    }

    private generateParagraph(node: AstComponentNode): string {
        return this.template.writeParagraph(node.v.v);
    }

    private async generateCodeblock(node: AstCodeblockComponentNode): Promise<string> {
        const src = node.v.src;
        let evalResult: string = undefined;

        if (node.v.run) {
            // This code chunk should be run
            const evaluation = await this.evaluateCodeChunk(src);
            switch (evaluation.type) {
                case "str":
                    evalResult = evaluation.value as string;
                case "int":
                    evalResult = parseInt(evaluation.value as string).toString();
                default:
                    evalResult = `Unknown type ${evaluation.type}`;
            }
        }

        return this.template.writeCodeblock(src, evalResult);
    }

    private evaluateCodeChunk(chunk: string): Promise<EvalResult | undefined> {
        if (!this.codeEvaluator) {
            // No code evaluator
            throw new Error("Code evaluation requested but no evaluator provided");
        }

        return this.codeEvaluator.eval(chunk);
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
