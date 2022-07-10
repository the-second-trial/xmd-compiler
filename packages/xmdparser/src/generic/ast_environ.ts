import { AstComponentNode } from "../ast";

export interface WithEnvironsAst {
    t: "start";
    v: Array<WithEnvironsAstComponentNode>;
}

export interface TheoremEnvironAstComponentNode {
    t: "theorem";
    v: {
        title: string;
        statement: string;
        proof?: string;
    };
}

export type EnvironAstComponentNode =
    | TheoremEnvironAstComponentNode;

export type WithEnvironsAstComponentNode =
    | AstComponentNode
    | EnvironAstComponentNode;

