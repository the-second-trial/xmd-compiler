import { XmdAst } from "../ast";
import { EnvironmentAstTransformer } from "./ast_environ_transformer";

describe("EnvironmentAstTransformer tests", () => {
    test("empty input AST", () => {
        // Arrange
        const ast: XmdAst = {
            t: "start",
            v: [],
        };
        const transformer = new EnvironmentAstTransformer();

        // Act
        const tAst = transformer.transform(ast);

        // Assert
        expect(tAst.t).toBe("start");
        expect(tAst.v.length).toBe(0);
    });
});
