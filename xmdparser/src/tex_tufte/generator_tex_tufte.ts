import { AstCodeblockComponentNode, AstEquationblockComponentNode, AstHeadingComponentNode, AstImageComponentNode, AstParagraphComponentBoldTextNode, AstParagraphComponentCodeInlineNode, AstParagraphComponentEquationInlineNode, AstParagraphComponentItalicTextNode, AstParagraphComponentNode, AstParagraphComponentTextNode, XmdAst } from "../ast";
import { CodeChunkEvaluator, EvalResult } from "../code_srv";
import { Constants } from "../constants";
import { ExtensionsManager, ImageExtensionAttributes } from "../extensions";
import { Generator } from "../generator";
import { DocumentInfo } from "../semantics";
import { TexTufteRenderer } from "./renderer_tex_tufte";

/** A component capable of rendering the final code. */
export class TexTufteGenerator implements Generator {
    private extMan: ExtensionsManager;
    private renderer: TexTufteRenderer;

    /**
     * Initializes a new instance of this class.
     * @param outputDir The path to the location where the output directory will be created.
     * @param srcPath The path to the input source file.
     * @param codeEvaluator The Python code chunk evaluator.
     */
     constructor(
        outputDir: string,
        srcPath: string,
        private codeEvaluator?: CodeChunkEvaluator
    ) {
        this.extMan = new ExtensionsManager();
        this.renderer = new TexTufteRenderer({
            outputPath: outputDir,
            inputPath: srcPath,
        })
    }

    /** @inheritdoc */
    public generate(ast: XmdAst): Promise<string> {
        if (!ast || ast.t !== "start") {
            throw new Error("AST cannot be null, undefined or malformed");
        }
    
        if (!TexTufteGenerator.checkAst(ast)) {
            throw new Error("Malformed AST");
        }
    
        return this.generateStart(ast);
    }

    /** @inheritdoc */
    public write(output: string): string {
        return this.renderer.writeToFile(output);
    }

    private extractSemanticInfo(node: XmdAst): DocumentInfo {
        // Title
        // The title is considered to be the very first level 1 heading found in the AST root flow.
        const titleHeading = node.v.find(c => c.t === "heading" && (c as AstHeadingComponentNode).v.p.type === 1) as AstHeadingComponentNode;
        const title = titleHeading?.v?.v || "Untitled";

        return {
            title,
        };
    }
    
    private async generateStart(node: XmdAst): Promise<string> {
        const docInfo = this.extractSemanticInfo(node);

        // Cannot use Promise.all(.map) because the calls to each codeblock are order-dependant
        const flow: Array<string> = [];
        for (const componentNode of node.v) {
            let renderedComponent = "";
            switch (componentNode.t) {
                case Constants.NodeTypes.HEADING:
                    renderedComponent = this.generateHeading(componentNode as AstHeadingComponentNode);
                    break;
                case Constants.NodeTypes.PARAGRAPH:
                    renderedComponent = await this.generateParagraph(componentNode as AstParagraphComponentNode);
                    break;
                case Constants.NodeTypes.CODEBLOCK:
                    renderedComponent = await this.generateCodeblock(componentNode as AstCodeblockComponentNode);
                    break;
                case Constants.NodeTypes.EQBLOCK:
                    renderedComponent = await this.generateEquationblock(componentNode as AstEquationblockComponentNode);
                    break;
                case Constants.NodeTypes.IMAGE:
                    renderedComponent = await this.generateImage(componentNode as AstImageComponentNode);
                    break;
                default:
                    throw new Error(`Unrecognized node type'${componentNode.t}'`);
            }

            if (!renderedComponent) {
                throw new Error("Component did not render");
            }

            flow.push(renderedComponent);
        }

        const reducedFlow = flow.reduce((a: any, b: any) => `${a}${b}`, "");

        return this.renderer.writeRoot(reducedFlow, docInfo);
    }

    private generateHeading(node: AstHeadingComponentNode): string {
        const text = node.v.v;
        const level = node.v.p.type;
        return this.renderer.writeHeading(text, level);
    }

    private async generateParagraph(node: AstParagraphComponentNode): Promise<string> {
        // Cannot use Promise.all(.map) because the calls to each codeblock are order-dependant
        const flow: Array<string> = [];
        for (const par of node.v.v) {
            let renderedComponent = "";
            switch (par.t) {
                case Constants.NodeTypes.PAR_TEXT:
                    const textPar = par as AstParagraphComponentTextNode;
                    renderedComponent = this.renderer.writeParagraphText(textPar.v);
                    break;
                case Constants.NodeTypes.PAR_BOLD:
                    const boldPar = par as AstParagraphComponentBoldTextNode;
                    renderedComponent = this.renderer.writeParagraphBoldText(boldPar.v);
                    break;
                case Constants.NodeTypes.PAR_ITALIC:
                    const italicPar = par as AstParagraphComponentItalicTextNode;
                    renderedComponent = this.renderer.writeParagraphItalicText(italicPar.v);
                    break;
                case Constants.NodeTypes.PAR_CODEINLINE:
                    const codeinlinePar = par as AstParagraphComponentCodeInlineNode;
                    renderedComponent = await this.generateCodeinline(codeinlinePar);
                    break;
                case Constants.NodeTypes.PAR_EQINLINE:
                    const eqinlinePar = par as AstParagraphComponentEquationInlineNode;
                    renderedComponent = await this.renderer.writeParagraphEquationInlineText(eqinlinePar.v);
                    break;
                default:
                    throw new Error(`Unrecognized par type'${par.t}'`);
            }

            if (!renderedComponent) {
                throw new Error("Par component did not render");
            }

            flow.push(renderedComponent);
        }

        const reducedFlow = flow.reduce((a: any, b: any) => `${a}${b}`, "");

        return this.renderer.writeParagraph(reducedFlow);
    }

    private async generateCodeblock(node: AstCodeblockComponentNode): Promise<string> {
        const [src, evalResult] = await this.generateCodeComponent(node);
        return this.renderer.writeCodeblock(src, evalResult);
    }

    private generateEquationblock(node: AstEquationblockComponentNode): string {
        return this.renderer.writeEquationblock(node.v);
    }

    private generateImage(node: AstImageComponentNode): string {
        const ext = this.extMan.parse(
            (node.v.ext?.v || [])
                .map(x => `${x.v.name}=${x.v.value || "true"}`)
                .join(",")
        );
        return this.renderer.writeImage(node.v.alt, node.v.path, node.v.title, ext.result as ImageExtensionAttributes);
    }

    private async generateCodeinline(node: AstParagraphComponentCodeInlineNode): Promise<string> {
        const [src, evalResult] = await this.generateCodeComponent(node);
        return this.renderer.writeParagraphCodeInline(src, evalResult);
    }

    private async generateCodeComponent(node: AstCodeblockComponentNode | AstParagraphComponentCodeInlineNode): Promise<[string, string]> {
        const src = node.v.src;
        let evalResult: string = undefined;

        if (node.v.run) {
            // This code chunk should be run
            const evaluation = await this.evaluateCodeChunk(src);
            switch (evaluation.type) {
                case "str":
                    evalResult = evaluation.value as string;
                    break;
                case "int":
                    evalResult = parseInt(evaluation.value as string).toString();
                    break;
                default:
                    evalResult = `Unknown type: '${evaluation.type}'`;
                    break;
            }
        }

        return [src, evalResult];
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
