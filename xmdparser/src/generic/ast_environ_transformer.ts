import { AstComponentNode, AstHeadingComponentNode, AstParagraphComponentNode, XmdAst } from "../ast";
import { AstTransformer } from "../ast_transformer";
import { Constants } from "../constants";
import { ExtensionsManager, stringifyExtensionCluasesArray } from "../extensions/extensions";
import { EnvironAstComponentNode, WithEnvironsAst, WithEnvironsAstComponentNode } from "./ast_environ";

type EnvironmentNodeType =
    | "theorem";

interface EnvironmentHandlingResult {
    environComponentNode: EnvironAstComponentNode;
    skip: number;
}

/**
 * Transforms the main component flow into one that takes
 * care of the environments.
 */
export class EnvironmentAstTransformer implements AstTransformer<WithEnvironsAst> {
    private extMan: ExtensionsManager;

    constructor() {
        this.extMan = new ExtensionsManager();
    }

    /** @inheritdoc */
    public transform(ast: XmdAst): WithEnvironsAst {
        const newComponents: Array<WithEnvironsAstComponentNode> = [];

        for (let i = 0, l = ast.v.length; i < l;) {
            const componentNode = ast.v[i];
            const slice = ast.v.slice(i);

            const environType = this.getEnvironmentNodeType(slice);
            if (environType) {
                // An environment includes the current component node and possibly
                // other component nodes coming after it, it will never go
                // backwards, only forward
                const { environComponentNode, skip } = this.handleEnvironmentNode(slice, environType);

                newComponents.push(environComponentNode);
                i += skip;

                continue;
            }

            newComponents.push(componentNode);
            i++;
        }

        return {
            t: "start",
            v: newComponents,
        };
    }

    private handleEnvironmentNode(slice: Array<AstComponentNode>, type: EnvironmentNodeType): EnvironmentHandlingResult {
        switch (type) {
            case "theorem":
                return this.handleTheoremEnvironmentNode(slice);
            default:
                throw new Error(`Unknown environment node '${type}'`);
        }
    }

    private getEnvironmentNodeType(slice: Array<AstComponentNode>): EnvironmentNodeType | null {
        if (this.isTheoremEnvironmentNode(slice)) {
            return "theorem";
        }

        return null;
    }

    private isTheoremEnvironmentNode(slice: Array<AstComponentNode>): boolean {
        if (slice[0].t !== Constants.NodeTypes.HEADING) {
            return false;
        }

        const firstNode = slice[0] as AstHeadingComponentNode;

        if (!firstNode.v.ext) {
            return false;
        }
        const clauses = this.extMan.parse(stringifyExtensionCluasesArray(firstNode.v.ext.v)).result;
        const theoremClause = clauses["theorem"];

        if (!theoremClause) {
            return false;
        }

        // Expected structure:
        // Heading => Paragraph => Paragraph
        if (slice.length >= 3) {
            return firstNode.v.p.type === 1 &&
                slice[1].t === Constants.NodeTypes.PARAGRAPH &&
                slice[2].t === Constants.NodeTypes.PARAGRAPH;
        }

        return false;
    }

    private handleTheoremEnvironmentNode(slice: Array<AstComponentNode>): EnvironmentHandlingResult {
        const titleNode = slice[0] as AstHeadingComponentNode;
        const statementNode = slice[1] as AstParagraphComponentNode;
        const proofNode = slice[2] as AstParagraphComponentNode;

        return {
            environComponentNode: {
                t: "theorem",
                v: {
                    title: titleNode.v.v,
                    statement: statementNode.v.v.map(x => x.v).join(""),
                    proof: proofNode.v.v.map(x => x.v).join(""),
                },
            },
            skip: 3,
        };
    }
}