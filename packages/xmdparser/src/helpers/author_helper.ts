import { AstBaseNode, AstHeadingComponentNode, AstParagraphComponentNode } from "../ast";
import { Constants } from "../constants";

export class AuthorHelper {
    constructor(
        private node: { v: Array<AstBaseNode> }
    ) {}

    public getAuthor(): string {
        const titleIndex = this.node.v.findIndex(child => child.t === Constants.NodeTypes.HEADING && (child as AstHeadingComponentNode).v.p.type === 1);
        if (titleIndex < 0) {
            return "";
        }

        const childrenFromTitle = this.node.v.slice(titleIndex); // Title not included
        const authorNodeIndex = childrenFromTitle.findIndex(child =>
            child.t === Constants.NodeTypes.HEADING &&
            (child as AstHeadingComponentNode).v.p.type <= 2 &&
            (child as AstHeadingComponentNode).v.v.toLowerCase().trim() === Constants.Keywords.AUTHOR);
        if (authorNodeIndex < 0) {
            return "";
        }

        const childrenFromAuthorHeading = this.node.v.slice(authorNodeIndex); // Heading not included
        const authorParNode = childrenFromAuthorHeading.find(child => child.t === Constants.NodeTypes.PARAGRAPH);
        if (!authorParNode) {
            return "";
        }

        return (authorParNode as AstParagraphComponentNode).v.v
            .map(x => x.v as string)
            .join("");
    }
}
