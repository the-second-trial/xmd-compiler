import { AstComponentNode } from "../../ast";

export interface HtmlSlidesTransformedAst {
    t: "start";
    v: Array<SlideAstNode>;
}

export interface SlideAstNode {
    t: "slide";
    v: Array<AstComponentNode>;
}
