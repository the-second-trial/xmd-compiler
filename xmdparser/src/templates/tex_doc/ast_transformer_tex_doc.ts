import { AstBaseNode, AstHeadingComponentNode, AstRootNode } from "../../ast";
import { AstTransformer } from "../../ast_transformer";
import { Constants } from "../../constants";

export class TexDocAstTransformer implements AstTransformer<AstRootNode> {
    /** @inheritdoc */
    public transform(ast: AstRootNode): AstRootNode {
        const withoutTitle = this.removeTitleNode(ast);
        const withoutAuthor = this.removeAuthorNodes(withoutTitle);

        return withoutAuthor;
    }

    private removeTitleNode(ast: AstRootNode): AstRootNode {
        let newComponentNodes = [ ...ast.v ];

        if (isTitleNode(newComponentNodes[0])) {
            newComponentNodes = newComponentNodes.slice(1);
        }

        return {
            t: "start",
            v: newComponentNodes,
        };
    }

    private removeAuthorNodes(ast: AstRootNode): AstRootNode {
        let newComponentNodes = [ ...ast.v ];

        for (let i = 0, l = newComponentNodes.length; i < l; i++) {
            const componentNode = newComponentNodes[i];

            if (isAuthorHeadingNode(componentNode)) {
                const nextNode = newComponentNodes[i + 1];
                const isNextAuthorContent = nextNode && nextNode.t === Constants.NodeTypes.PARAGRAPH;

                newComponentNodes = newComponentNodes.slice(!isNextAuthorContent ? i + 1 : i + 2);

                break;
            }
        }
        
        return {
            t: "start",
            v: newComponentNodes,
        };
    }
}

function isTitleNode(node: AstBaseNode): boolean {
    return node.t === Constants.NodeTypes.HEADING &&
        (node as AstHeadingComponentNode).v.p.type === 1;
}

function isAuthorHeadingNode(node: AstBaseNode): boolean {
    return node.t === Constants.NodeTypes.HEADING &&
        (node as AstHeadingComponentNode).v.p.type <= 2 &&
        (node as AstHeadingComponentNode).v.v.toLowerCase().trim() === Constants.Keywords.AUTHOR;
}
