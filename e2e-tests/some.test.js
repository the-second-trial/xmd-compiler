const common = require("./common");
const path = require("path");

describe("plain markdown", () => {
    beforeAll(() => {
        // Nothing
    });

    afterAll(() => {
        // Nothing
    });

    test("generate tex", async () => {
        await common.callXmd(path.join(__dirname, "simple.md"), common.TEMPLATE_TEX_DOC);
    });
});