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
    v: {
        run: boolean,
        src: string,
    };
}

export type AstComponentNode =
    | AstHeadingComponentNode
    | AstParagraphComponentNode
    | AstCodeblockComponentNode;

export interface XmdAst {
    t: "start";
    v: Array<AstComponentNode>;
}
