export interface AstHeadingComponentNode {
    t: "heading";
    v: any;
}

export interface AstParagraphComponentNode {
    t: "paragraph";
    v: any;
}

export interface AstCodeblockComponentNode {
    t: "codeblock";
    v: any;
}

export type AstComponentNode =
    | AstHeadingComponentNode
    | AstParagraphComponentNode
    | AstCodeblockComponentNode;

export interface XmdAst {
    t: "start";
    v: Array<AstComponentNode>;
}
