import { XmdAst } from "../ast";
import { AstTransformer } from "../ast_transformer";

export class HtmlSlidesAstTransformer implements AstTransformer<string> {
    /** @inheritdoc */
    public transform(ast: XmdAst): string {
        return "";
    }
}