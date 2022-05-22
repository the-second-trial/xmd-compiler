import { AstComponentNode, AstHeadingComponentNode, AstRootDirectiveNode, AstRootNode } from "../ast";
import { AstTransformer } from "../ast_transformer";
import { Constants } from "../constants";
import { DefinitionsDirectivesController } from "../directives";
import { ExtensionsManager, stringifyExtensionCluasesArray } from "../extensions/extensions";

/**
 * Transforms the AST in order to remove content that does not meet conditions.
 */
export class ConditionalContentAstTransformer implements AstTransformer<AstRootNode> {
    private extMan: ExtensionsManager;
    private directivesController: DefinitionsDirectivesController;

    constructor() {
        this.extMan = new ExtensionsManager();
        this.directivesController = new DefinitionsDirectivesController()
    }

    /** @inheritdoc */
    public transform(ast: AstRootNode): AstRootNode {
        const newComponents: Array<AstComponentNode> = [];

        let level = 0;
        for (let i = 0, l = ast.v.length; i < l; i++) {
            const componentNode = ast.v[i] as AstComponentNode;

            switch (componentNode.t) {
                case Constants.NodeTypes.ROOT_DIRECTIVE:
                    const rootDirectiveNode = componentNode as AstRootDirectiveNode;
                    this.directivesController.processDirective(rootDirectiveNode.v, false);
                    break;

                case Constants.NodeTypes.HEADING:
                    const headingNode = componentNode as AstHeadingComponentNode;

                    if (level > 0) {
                        if (headingNode.v.p.type <= level) {
                            // We are encountering a heading defining a section
                            // not inside the one that was marked to be hidden,
                            // so we can stop unrendering nodes
                            level = 0; // Reset and stop removing nodes
                        } else {
                            // We are encountering a section which falls inside
                            // a section marked to be hidden ==> hide
                            continue; // Do not include the node in the output AST
                        }
                    }

                    if (headingNode.v.ext) {
                        const clauses = this.extMan.parse(stringifyExtensionCluasesArray(headingNode.v.ext.v)).result;
                        const ifClauseValue = clauses.if; // This holds the name of the def to look for

                        if (this.directivesController.getDef(ifClauseValue) === null) {
                            // The def in the if was not found ==> do not render
                            level = headingNode.v.p.type;
                            continue; // Do not include the node in the output AST
                        }
                    }
                    break;

                default:
                    if (level > 0) {
                        continue; // Keep removing nodes as they are still part of the same section
                    }
                    break;
            }

            newComponents.push(componentNode);
        }

        return {
            t: "start",
            v: newComponents,
        };
    }
}