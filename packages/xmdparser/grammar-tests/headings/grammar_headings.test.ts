import { join } from "path";
import { readFileSync } from "fs";

import { XmdParser } from "../../src/parser";

describe("grammar tests", () => {
    describe("headings", () => {
        test("sample", () => {
            // Arrange
            const source = readFileSync(join(__dirname, "with_double_newline.md"), { encoding: "utf-8" });
            
            // Act
            const ast = new XmdParser().parse(source);
    
            // Assert
            expect(ast.v.length).toBe(3);
        });
    });
});
