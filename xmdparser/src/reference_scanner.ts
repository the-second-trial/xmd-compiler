import { AstComponentNode, AstRootDirectiveNode } from "./ast";
import { Constants } from "./constants";
import { XmdParser } from "./parser";

export interface ReferenceInfo {
    name: string;
    vpath: string;
}

export class ReferenceScanner {
    public scan(source: string): Array<ReferenceInfo> {
        const ast = new XmdParser().parse(source);
        const components = ast.v;

        return components
            .filter((node: AstComponentNode) => node.t === "rootdirect" && node.v.v[0].v.name === Constants.Directives.IMPORT)
            .map((node: AstRootDirectiveNode) => ({
                name: node.v.v[0].v.name,
                vpath: node.v.v[0].v.value,
            }));
    }
}
