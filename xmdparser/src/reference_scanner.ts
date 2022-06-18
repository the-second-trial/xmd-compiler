import { AstComponentNode, AstImageComponentNode, AstRootDirectiveNode } from "./ast";
import { Constants } from "./constants";
import { XmdParser } from "./parser";

export interface ReferenceInfo {
    name: string;
    vpath: string;
    type: "md" | "image";
}

/** A component for scanning for references. */
export class ReferenceScanner {
    /**
     * Scans the source code and returns all external references.
     * @param source The input source code.
     * @returns The collection of found references.
     */
    public scan(source: string): Array<ReferenceInfo> {
        const ast = new XmdParser().parse(source);
        const components = ast.v;

        return []
            .concat(this.scanMdReferences(components))
            .concat(this.scanImageReferences(components));
    }

    private scanMdReferences(components: Array<AstComponentNode>): Array<ReferenceInfo> {
        return components
            .filter((node: AstComponentNode) => node.t === "rootdirect" && node.v.v[0].v.name === Constants.Directives.IMPORT)
            .map((node: AstRootDirectiveNode) => ({
                name: node.v.v[0].v.name,
                vpath: node.v.v[0].v.value,
                type: "md",
            }));
    }

    private scanImageReferences(components: Array<AstComponentNode>): Array<ReferenceInfo> {
        return components
            .filter((node: AstComponentNode) => node.t === "image")
            .map((node: AstImageComponentNode) => ({
                name: node.v.title,
                vpath: node.v.path,
                type: "image",
            }));
    }
}
