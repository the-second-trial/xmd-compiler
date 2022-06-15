const common = require("./common");
const path = require("path");

common.callXmd(path.join(__dirname, "simple.md"), common.TEMPLATE_TEX_DOC)
    .then(out => {
        console.log("COMPLETED", out);
    })
    .catch(err => {
        console.log("ERROR", err);
    });