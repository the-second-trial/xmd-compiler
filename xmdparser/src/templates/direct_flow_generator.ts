import { AstBaseNode, AstCodeblockComponentNode, AstEquationblockComponentNode, AstHeadingComponentNode, AstRootDirectiveNode, AstHRuleNode, AstImageComponentNode, AstParagraphComponentBoldTextNode, AstParagraphComponentCodeInlineNode, AstParagraphComponentEquationInlineNode, AstParagraphComponentItalicTextNode, AstParagraphComponentNode, AstParagraphComponentTextNode, XmdAst, AstInlineDirectiveNode, AstRootNode } from "../ast";
import { CodeChunkEvaluator, EvalResult } from "../code_srv";
import { Constants } from "../constants";
import { ExtensionsManager, ImageExtensionAttributes, stringifyExtensionCluasesArray } from "../extensions/extensions";
import { Generator } from "../generator";
import { DocumentInfo } from "../semantics";
import { DirectFlowRenderer } from "./direct_flow_renderer"
import { ProgressController } from "../progress_controller";
import { DebugController } from "../debugging";
import { DirectivesController } from "../directives";
import { ConditionalContentAstTransformer } from "../generic/ast_conditional_content_transformer";
import { ResourceImage } from "../resource_image";

/** A component capable of rendering the final code. */
export class DirectFlowGenerator implements Generator {
    private extMan: ExtensionsManager;
    private _directivesController: DirectivesController;
    protected docInfo: DocumentInfo;

    /**
     * Initializes a new instance of this class.
     * @param renderer The renderer to use.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        protected renderer: DirectFlowRenderer,
        protected outputImage: ResourceImage,
        protected inputImage: ResourceImage,
        protected codeEvaluator?: CodeChunkEvaluator
    ) {
        this.extMan = new ExtensionsManager();
    }

    /** @inheritdoc */
    public get output(): ResourceImage {
        return this.outputImage;
    }

    /** @inheritdoc */
    public async generate(ast: XmdAst): Promise<string> {
        if (!this.checkAst(ast)) {
            throw new Error("Malformed AST");
        }

        // Extract semantic info on the original tree
        this.docInfo = this.extractSemanticInfo(ast);
    
        const transformedAst = this.transformAst(ast);
        DebugController.instance.transformedAst = JSON.stringify(transformedAst);
        
        const output = await this.generateStart(transformedAst);
        this.renderer.writeOutput(output);

        return output;
    }

    /**
     * Handles the root level and generates the flow.
     * @param node The input root node.
     * @returns The rendered flow.
     */
    public async generateFlow(node: { v: Array<AstBaseNode> }): Promise<string> {
        // Cannot use Promise.all(.map) because the calls to each codeblock are order-dependant
        const flow: Array<string> = [];
        let componentsProcessedCount = 0;

        for (const componentNode of node.v) {
            const renderedComponent = await this.handleAstComponentNodeRendering(componentNode);

            flow.push(renderedComponent);

            ProgressController.instance.updateStateOfGenerate(
                Math.ceil(++componentsProcessedCount / node.v.length * 100)
            );
        }

        const reducedFlow = flow.reduce((a: any, b: any) => `${a}${b}`, "");

        return reducedFlow;
    }

    /**
     * Creates the @see DirectivesController.
     * @returns The controller.
     */
    protected createDirectivesController(): DirectivesController | undefined {
        throw new Error("Not implemented");
    }

    /**
     * Handles the rendering of a component node.
     * @param componentNode The component node.
     * @returns The rendered component node.
     */
    protected async handleAstComponentNodeRendering(componentNode: AstBaseNode): Promise<string> {
        switch (componentNode.t) {
            case Constants.NodeTypes.HEADING:
                return this.generateHeading(componentNode as AstHeadingComponentNode);
            case Constants.NodeTypes.PARAGRAPH:
                return await this.generateParagraph(componentNode as AstParagraphComponentNode);
            case Constants.NodeTypes.CODEBLOCK:
                return await this.generateCodeblock(componentNode as AstCodeblockComponentNode);
            case Constants.NodeTypes.EQBLOCK:
                return await this.generateEquationblock(componentNode as AstEquationblockComponentNode);
            case Constants.NodeTypes.IMAGE:
                return await this.generateImage(componentNode as AstImageComponentNode);
            case Constants.NodeTypes.HRULE:
                return this.generateHRule(componentNode as AstHRuleNode);
            case Constants.NodeTypes.ROOT_DIRECTIVE:
                return await this.generateRootDirective(componentNode as AstRootDirectiveNode);
            default:
                throw new Error(`Unrecognized node type'${componentNode.t}'`);
        }
    }

    /**
     * Returns a value indicating whether the root node is correct.
     * @param ast The root node.
     * @returns True if ok, false otherwise.
     */
    protected checkAst(ast: any): boolean {
        if (!ast.t || ast.t !== Constants.NodeTypes.START) {
            return false;
        }
    
        if (!ast.v || typeof ast.v !== "object" || ast.v.length <= 0) {
            return false;
        }
    
        return true;
    }

    /**
     * Transforms the AST before it is processed for tracversal and generation.
     * @param ast The input AST.
     * @returns A new AST.
     */
    protected transformAst(ast: AstRootNode): AstRootNode {
        const transformer = new ConditionalContentAstTransformer();
        return transformer.transform(ast);
    }

    /**
     * Extracts the semantic information from the AST.
     * @param node The root node.
     * @returns The semantic info.
     */
    protected extractSemanticInfo(node: AstRootNode): DocumentInfo {
        // Title
        // The title is considered to be the very first level 1 heading found in the AST root flow.
        const titleHeading = node.v.find(c => c.t === "heading" && (c as AstHeadingComponentNode).v.p.type === 1) as AstHeadingComponentNode;
        const title = titleHeading?.v?.v || "Untitled";

        return {
            title,
        };
    }

    /**
     * Generates the start node.
     * @param node The start node.
     * @returns The generated output.
     */
    protected async generateStart(node: AstRootNode): Promise<string> {
        const flow: string = await this.generateFlow(node);

        // Here, we have gone through the whole tree and certain
        // properties will be available at this point
        this.docInfo.language = this.directivesController.lang;
        
        return this.renderer.writeRoot(flow, this.docInfo);
    }

    private get directivesController(): DirectivesController {
        if (!this._directivesController) {
            this._directivesController = this.createDirectivesController();
        }

        return this._directivesController;
    }

    private generateHeading(node: AstHeadingComponentNode): string {
        const text = node.v.v;
        const level = node.v.p.type;
        return this.renderer.writeHeading(text, level);
    }

    private async generateRootDirective(node: AstRootDirectiveNode): Promise<string> {
        const result = await this.directivesController.processDirective(node.v);
        return result || "";
    }

    private async generateInlineDirective(node: AstInlineDirectiveNode): Promise<string> {
        const result = await this.directivesController.processDirective(node.v, true);
        if (typeof result === "string") {
            return result;
        }

        throw new Error(`Error while processing inline directive`);
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
                case Constants.NodeTypes.INLINE_DIRECTIVE:
                    const inlineDirectPar = par as AstInlineDirectiveNode;
                    renderedComponent = await this.generateInlineDirective(inlineDirectPar);
                    break;
                default:
                    throw new Error(`Unrecognized par type: '${par.t}'`);
            }

            flow.push(renderedComponent);
        }

        const reducedFlow = flow.reduce((a: any, b: any) => `${a}${b}`, "");

        return this.renderer.writeParagraph(reducedFlow);
    }

    private async generateCodeblock(node: AstCodeblockComponentNode): Promise<string> {
        const [src, evalResult] = await this.generateAndEvalCodeComponent(node);
        const ext = this.extMan.parse(stringifyExtensionCluasesArray(node.v.ext?.v));

        return ext.result.hidden
            ? ""
            : this.renderer.writeCodeblock(src, evalResult, ext.result.output);
    }

    private generateEquationblock(node: AstEquationblockComponentNode): string {
        return this.renderer.writeEquationblock(node.v);
    }

    private generateImage(node: AstImageComponentNode): string {
        const ext = this.extMan.parse(stringifyExtensionCluasesArray(node.v.ext?.v));
        return this.renderer.writeImage(node.v.alt, node.v.path, node.v.title, ext.result as ImageExtensionAttributes);
    }

    private generateHRule(node: AstHRuleNode): string {
        return this.renderer.writeHRule();
    }

    private async generateCodeinline(node: AstParagraphComponentCodeInlineNode): Promise<string> {
        const [src, evalResult] = await this.generateAndEvalCodeComponent(node);
        return this.renderer.writeParagraphCodeInline(src, evalResult);
    }

    private async generateAndEvalCodeComponent(
        node: AstCodeblockComponentNode | AstParagraphComponentCodeInlineNode
    ): Promise<[string, string]> {
        const src = node.v.src;
        let evalResult: string = undefined;

        if (node.v.run) {
            // This code chunk should be run
            // TODO: Refactor as the result will always be string from JSON
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
}
