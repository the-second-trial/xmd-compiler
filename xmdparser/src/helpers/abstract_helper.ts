import { AstBaseNode, AstHeadingComponentNode, AstParagraphComponentNode } from "../ast";
import { Constants } from "../constants";

export class AbstractHelper {
    constructor(
        private node: { v: Array<AstBaseNode> }
    ) {}

    public getAbstract(): Array<string> {
        const titleIndex = this.node.v.findIndex(child => child.t === Constants.NodeTypes.HEADING && (child as AstHeadingComponentNode).v.p.type === 1);
        if (titleIndex < 0) {
            return [];
        }

        const childrenFromTitle = this.node.v.slice(titleIndex); // Title not included
        const abstractNodeIndex = childrenFromTitle.findIndex(child =>
            child.t === Constants.NodeTypes.HEADING &&
            (child as AstHeadingComponentNode).v.p.type <= 2 &&
            (child as AstHeadingComponentNode).v.v.toLowerCase().trim() === Constants.Keywords.ABSTRACT);
        if (abstractNodeIndex < 0) {
            return [];
        }

        const childrenFromAbstractHeading = this.node.v.slice(abstractNodeIndex); // Heading not included
        const abstractParNode = childrenFromAbstractHeading.find(child => child.t === Constants.NodeTypes.PARAGRAPH);
        if (!abstractParNode) {
            return [];
        }

        return (abstractParNode as AstParagraphComponentNode).v.v
            .map(x => x.v as string);
    }
}
