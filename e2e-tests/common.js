const process = require("child_process");
const path = require("path");

module.exports.hello = function() {
    return "Hello World";
}

module.exports.callXmd = function(src, template) {
    const pathToXmd = path.join(__dirname, "..", "lib", "xmdparser.js");

    return new Promise((resolve, reject) => {
        process.exec(["node", pathToXmd, "--src", src, "--template", template].join(" "), (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve(stdout);
        });
    });
}

module.exports.TEMPLATE_TEX_DOC = "tex_doc";
