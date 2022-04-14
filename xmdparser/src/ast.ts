export interface AstHeadingComponentNode {
    t: "heading";
    v: {
        t: "heading_text",
        v: string,
        p: {
            type: number,
        },
    };
}

export interface AstParagraphComponentTextNode {
    t: "text";
    v: string;
}

export interface AstParagraphComponentBoldTextNode {
    t: "bold";
    v: string;
}

export interface AstParagraphComponentItalicTextNode {
    t: "italic";
    v: string;
}

export interface AstParagraphComponentCodeInlineNode {
    t: "codeinline";
    v: {
        run: boolean,
        src: string,
    };
}

export interface AstParagraphComponentEquationInlineNode {
    t: "eqinline";
    v: string;
}

export type AstParagraphComponentNodeValue =
    | AstParagraphComponentTextNode
    | AstParagraphComponentBoldTextNode
    | AstParagraphComponentItalicTextNode
    | AstParagraphComponentCodeInlineNode
    | AstParagraphComponentEquationInlineNode;

export interface AstParagraphComponentNode {
    t: "paragraph";
    v: {
        t: "par",
        v: Array<AstParagraphComponentNodeValue>,
    };
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
