import { dirname } from "path";

import { AstHeadingComponentNode, AstRootNode, XmdAst } from "../../ast";
import { CodeChunkEvaluator } from "../../code_srv";
import { Constants } from "../../constants";
import { DebugController } from "../../debugging";
import { DirectivesController } from "../../directives";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { DocumentInfo } from "../../semantics";
import { HtmlSlidesTransformedAst, SlideAstNode } from "./ast_html_slides";
import { HtmlSlidesAstTransformer, HTML_SLIDES_NODE_TYPE_SLIDE } from "./ast_transformer_html_slides";
import { HtmlSlidesImportedRenderer, HtmlSlidesRenderer } from "./renderer_html_slides";
import { ResourceImage } from "../../resource_image";

/** A component capable of rendering the final code. */
export class HtmlSlidesGenerator extends DirectFlowGenerator {
    /**
     * Initializes a new instance of this class.
     * @param srcPath The path to the input source file.
     * @param outputImage The output image to use.
     * @param inputImage The input image to use.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        private srcPath: string,
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlSlidesRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    public generate(ast: XmdAst): Promise<string> {
        if (!ast || ast.t !== "start") {
            throw new Error("AST cannot be null, undefined or malformed");
        }
    
        if (!HtmlSlidesGenerator.checkAst(ast)) {
            throw new Error("Malformed AST");
        }

        const transformedAst = new HtmlSlidesAstTransformer().transform(ast);
        DebugController.instance.transformedAst = JSON.stringify(transformedAst);
    
        return this.generateStart(transformedAst);
    }

    /** @inheritdoc */
    protected extractSemanticInfo(node: AstRootNode): DocumentInfo {
        // Title
        // The title is considered to be the very first level 1 heading found in the AST root flow.
        const searchTitle = (n: SlideAstNode) => n.v.find(c => c.t === "heading" && (c as AstHeadingComponentNode).v.p.type === 1) as AstHeadingComponentNode;

        const titleHeadingSlide = (node as HtmlSlidesTransformedAst).v.find(n => searchTitle(n) !== undefined);
        const titleHeading = searchTitle(titleHeadingSlide);
        const title = titleHeading?.v?.v || "Untitled";

        return {
            title,
        };
    }
    
    /** @inheritdoc */
    protected async generateStart(node: AstRootNode): Promise<string> {
        // Cannot use Promise.all(.map) because the calls to each codeblock are order-dependant
        const flow: Array<string> = [];
        for (const componentNode of node.v) {
            let renderedComponent = "";
            switch (componentNode.t) {
                case HTML_SLIDES_NODE_TYPE_SLIDE:
                    renderedComponent = await this.generateSlide(componentNode as SlideAstNode);
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

        return this.renderer.writeRoot(reducedFlow, this.docInfo);
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new HtmlSlidesImportedGenerator(this.srcPath, this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }

    private async generateSlide(node: SlideAstNode): Promise<string> {
        return (this.renderer as HtmlSlidesRenderer).writeSlide(
            await this.generateFlow(node)
        );
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

class HtmlSlidesImportedGenerator extends DirectFlowGenerator {
    constructor(
        private srcPath: string,
        outputImage: ResourceImage,
        inputImage: ResourceImage,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        super(
            new HtmlSlidesImportedRenderer(outputImage, inputImage),
            outputImage,
            inputImage,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    protected createDirectivesController(): DirectivesController | undefined {
        return new DirectivesController(
            dirname(this.srcPath),
            new HtmlSlidesImportedGenerator(this.srcPath, this.outputImage, this.inputImage, this.codeEvaluator)
        );
    }
}
