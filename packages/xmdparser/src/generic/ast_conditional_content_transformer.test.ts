import { createAst, createDef, createHeadingNode, createHeadingNodeWithCondition, createParagraphNode } from "../../tests/test_ast_utils";
import { XmdAst } from "../ast";
import { ConditionalContentAstTransformer } from "./ast_conditional_content_transformer";

describe("ConditionalContentAstTransformer tests", () => {
    test("empty input AST", () => {
        // Arrange
        const ast: XmdAst = {
            t: "start",
            v: [],
        };
        const transformer = new ConditionalContentAstTransformer();

        // Act
        const tAst = transformer.transform(ast);

        // Assert
        expect(tAst.t).toBe("start");
        expect(tAst.v.length).toBe(0);
    });

    test("one hidden section", () => {
        // Arrange
        const ast = createAst(
            createHeadingNode("A shown heading", 2),
            createParagraphNode("Some shown stuff"),
            createHeadingNodeWithCondition("A hidden heading", 2, "flag"),
            createParagraphNode("Some hidden stuff")
        );
        
        const transformer = new ConditionalContentAstTransformer();

        // Act
        const tAst = transformer.transform(ast);

        // Assert
        expect(tAst.v.length).toBe(2);
    });

    test("one guarded section shown", () => {
        // Arrange
        const def = "flag";
        const ast = createAst(
            createDef(def),
            createHeadingNode("A shown heading", 2),
            createParagraphNode("Some shown stuff"),
            createHeadingNodeWithCondition("A hidden heading", 2, def),
            createParagraphNode("Some hidden stuff")
        );
        
        const transformer = new ConditionalContentAstTransformer();

        // Act
        const tAst = transformer.transform(ast);

        // Assert
        expect(tAst.v.length).toBe(5);
    });

    test("alternating hidden sections", () => {
        // Arrange
        const ast = createAst(
            createHeadingNode("A shown heading", 2),
            createParagraphNode("Some shown stuff"),
            createHeadingNodeWithCondition("A hidden heading", 2, "flag"),
            createParagraphNode("Some hidden stuff"),
            createHeadingNode("Another shown heading", 2),
            createParagraphNode("Some other shown stuff"),
        );
        
        const transformer = new ConditionalContentAstTransformer();

        // Act
        const tAst = transformer.transform(ast);

        // Assert
        expect(tAst.v.length).toBe(4);
    });
});
