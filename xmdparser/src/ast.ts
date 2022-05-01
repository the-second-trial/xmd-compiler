export interface AstBaseNode {
    t: string;
    v: string | number | object;
}

export interface AstExtensionClauseNode extends AstBaseNode {
    t: "extclause";
    v: {
        name: string,
        value?: string,
    };
}

export interface AstExtensionStringNode extends AstBaseNode {
    t: "ext";
    v: Array<AstExtensionClauseNode>;
}

export interface AstHeadingComponentNode extends AstBaseNode {
    t: "heading";
    v: {
        t: "heading_text",
        v: string,
        p: {
            type: number,
        },
        ext?: AstExtensionStringNode,
    };
}

export interface AstParagraphComponentTextNode extends AstBaseNode {
    t: "text";
    v: string;
}

export interface AstParagraphComponentBoldTextNode extends AstBaseNode {
    t: "bold";
    v: string;
}

export interface AstParagraphComponentItalicTextNode extends AstBaseNode {
    t: "italic";
    v: string;
}

export interface AstInlineDirectiveNode extends AstBaseNode {
    t: "inlinedirect";
    v: AstExtensionStringNode;
}

export interface AstParagraphComponentCodeInlineNode extends AstBaseNode {
    t: "codeinline";
    v: {
        run: boolean,
        src: string,
    };
}

export interface AstParagraphComponentEquationInlineNode extends AstBaseNode {
    t: "eqinline";
    v: string;
}

export type AstParagraphComponentNodeValue =
    | AstParagraphComponentTextNode
    | AstParagraphComponentBoldTextNode
    | AstParagraphComponentItalicTextNode
    | AstInlineDirectiveNode
    | AstParagraphComponentCodeInlineNode
    | AstParagraphComponentEquationInlineNode;

export interface AstParagraphComponentNode extends AstBaseNode {
    t: "paragraph";
    v: {
        t: "par",
        v: Array<AstParagraphComponentNodeValue>,
    };
}

export interface AstCodeblockComponentNode extends AstBaseNode {
    t: "codeblock";
    v: {
        run: boolean,
        src: string,
    };
}

export interface AstEquationblockComponentNode extends AstBaseNode {
    t: "eqblock";
    v: string;
}

export interface AstImageComponentNode extends AstBaseNode {
    t: "image";
    v: {
        alt: string,
        path: string,
        title?: string,
        ext?: AstExtensionStringNode,
    };
}

export interface AstHRuleNode extends AstBaseNode {
    t: "hrule";
}

export interface AstRootDirectiveNode extends AstBaseNode {
    t: "rootdirect";
    v: AstExtensionStringNode;
}

export type AstComponentNode =
    | AstHeadingComponentNode
    | AstParagraphComponentNode
    | AstCodeblockComponentNode
    | AstEquationblockComponentNode
    | AstImageComponentNode
    | AstHRuleNode
    | AstRootDirectiveNode;

export interface XmdAst extends AstBaseNode {
    t: "start";
    v: Array<AstComponentNode>;
}
