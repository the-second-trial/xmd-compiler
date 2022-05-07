import { dirname } from "path";

import { AstHeadingComponentNode, XmdAst } from "../ast";
import { CodeChunkEvaluator } from "../code_srv";
import { Constants } from "../constants";
import { DirectFlowGenerator } from "../direct_flow_generator";
import { Generator } from "../generator";
import { DocumentInfo } from "../semantics";
import { HtmlSlidesTransformedAst, SlideAstNode } from "./ast_html_slides";
import { HtmlSlidesAstTransformer, HTML_SLIDES_NODE_TYPE_SLIDE } from "./ast_transformer_html_slides";
import { HtmlSlidesRenderer } from "./renderer_html_slides";

/** A component capable of rendering the final code. */
export class HtmlSlidesGenerator implements Generator {
    private renderer: HtmlSlidesRenderer;
    private generator: DirectFlowGenerator;

    /**
     * Initializes a new instance of this class.
     * @param outputDir The path to the location where the output directory will be created.
     * @param srcPath The path to the input source file.
     * @param codeEvaluator The Python code chunk evaluator.
     */
    constructor(
        outputDir: string,
        srcPath: string,
        codeEvaluator?: CodeChunkEvaluator
    ) {
        const renderer = new HtmlSlidesRenderer({
            outputPath: outputDir,
            inputPath: srcPath,
        });
        this.renderer = renderer;
        this.generator = new DirectFlowGenerator(
            renderer,
            codeEvaluator
        );
    }

    /** @inheritdoc */
    public get outputDirPath(): string {
        return this.renderer.outputDirPath;
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
    
        return this.generateStart(transformedAst);
    }

    /** @inheritdoc */
    public write(output: string): string {
        return this.renderer.writeToFile(output);
    }

    private extractSemanticInfo(node: HtmlSlidesTransformedAst): DocumentInfo {
        // Title
        // The title is considered to be the very first level 1 heading found in the AST root flow.
        const searchTitle = (n: SlideAstNode) => n.v.find(c => c.t === "heading" && (c as AstHeadingComponentNode).v.p.type === 1) as AstHeadingComponentNode;

        const titleHeadingSlide = node.v.find(n => searchTitle(n) !== undefined);
        const titleHeading = searchTitle(titleHeadingSlide);
        const title = titleHeading?.v?.v || "Untitled";

        return {
            title,
        };
    }
    
    private async generateStart(node: HtmlSlidesTransformedAst): Promise<string> {
        const docInfo = this.extractSemanticInfo(node);

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

        return this.renderer.writeRoot(reducedFlow, docInfo);
    }

    private async generateSlide(node: SlideAstNode): Promise<string> {
        return this.renderer.writeSlide(
            await this.generator.generateFlow(node)
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
