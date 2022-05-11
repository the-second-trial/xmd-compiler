import { XmdAst } from "../../ast";
import { AstTransformer } from "../../ast_transformer";
import { Constants } from "../../constants";
import { HtmlSlidesTransformedAst, SlideAstNode } from "./ast_html_slides";

export const HTML_SLIDES_NODE_TYPE_SLIDE = "slide";

export class HtmlSlidesAstTransformer implements AstTransformer<HtmlSlidesTransformedAst> {
    /** @inheritdoc */
    public transform(ast: XmdAst): HtmlSlidesTransformedAst {
        const slides: Array<SlideAstNode> = [
            { t: HTML_SLIDES_NODE_TYPE_SLIDE, v: [] },
        ];

        for (const componentNode of ast.v) {
            if (componentNode.t === Constants.NodeTypes.HRULE) {
                slides.push({ t: HTML_SLIDES_NODE_TYPE_SLIDE, v: [] });
                continue;
            }

            const slide = slides[slides.length - 1];
            slide.v.push(componentNode);
        }

        return {
            t: "start",
            v: slides,
        };
    }
}