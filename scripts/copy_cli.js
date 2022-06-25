const fs = require("fs");
const path = require("path");
const { exit } = require("process");

/**
 * Checks whether a directory exists.
 * @param {string} src The path to the directory.
 * @returns {boolean} A value indicating whether the directory exists or not.
 */
function dirExistsSynch(src) {
    return fs.existsSync(src) && fs.statSync(src)?.isDirectory();
}

/**
 * Acts like `cp -R`.
 * If src is a directory, its content will be copied inside dst.
 * If src is a file, it will be copied inside dst.
 * @param {string} src The path to the file or directory to copy.
 * @param {string} dst The new path (assumed not to exist).
 */
function cpSync(src, dst) {
    if (dirExistsSynch(src)) {
        if (!dirExistsSynch(dst)) fs.mkdirSync(dst);
        fs.readdirSync(src).forEach(childItemName => {
            cpSync(path.join(src, childItemName), path.join(dst, childItemName));
        });
    } else {
        fs.copyFileSync(src, dst);
    }
};

// Path to the project directory
const root_path = path.resolve(__dirname, "..");

const src = path.resolve(root_path, "cli", "lib");
const lib = path.resolve(root_path, "lib");
const dst = lib;

if (!dirExistsSynch(lib)) {
    console.log("Directory", lib, "does not exist, creating...");
    fs.mkdirSync(lib);
    console.log("Directory", lib, "created");
}

console.log("Copying", src, "Into", dst, "...");
cpSync(src, dst);
console.log(src, "Copied into", dst);

exit(0);
