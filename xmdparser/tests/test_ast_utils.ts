import { AstComponentNode, AstHeadingComponentNode, AstParagraphComponentNode, AstRootDirectiveNode, XmdAst } from "../src/ast";

export function createAst(...componentNodes: Array<AstComponentNode>): XmdAst {
    return {
        t: "start",
        v: componentNodes,
    };
}

export function createHeadingNode(text: string, type: number): AstHeadingComponentNode {
    return {
        t: "heading",
        v: {
            t: "heading_text",
            v: text,
            p: {
                type,
            },
            ext: null,
        },
    };
}

export function createHeadingNodeWithCondition(text: string, type: number, condDef: string): AstHeadingComponentNode {
    const node = createHeadingNode(text, type);
    node.v.ext = {
        t: "ext",
        v: [
            {
                t: "extclause",
                v: {
                    name: "if",
                    value: condDef,
                },
            },
        ],
    };

    return node;
}

export function createParagraphNode(text: string): AstParagraphComponentNode {
    return {
        t: "paragraph",
        v: {
            t: "par",
            v: [
                {
                    t: "text",
                    v: text,
                },
            ],
        },
    };
}

export function createDef(name: string): AstRootDirectiveNode {
    return {
        t: "rootdirect",
        v: {
            t: "ext",
            v: [
                {
                    t: "extclause",
                    v: {
                        name: "def",
                        value: name,
                    },
                },
            ],
        },
    };
}
