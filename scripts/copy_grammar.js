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
        fs.mkdirSync(dst);
        fs.readdirSync(src).forEach(childItemName => {
            cpSync(path.join(src, childItemName), path.join(dst, childItemName));
        });
    } else {
        fs.copyFileSync(src, dst);
    }
};

/**
 * Acts like `rm -R`.
 * @param {string} src The path to the directory to remove.
 */
function rmSync(src) {
    fs.rmSync(src, { recursive: true, force: true });

    if (dirExistsSynch(dst)) {
        throw new Error(`Directory ${src} still exists after removal`);
    }
}

// Path to the project directory
const root_path = path.resolve(__dirname, "..");

const src = path.resolve(root_path, "xmdparser", "src", "grammar", "xmd-grammar.pegjs");
const lib = path.resolve(root_path, "lib");
const dst = path.join(lib, "xmd-grammar.pegjs");

if (!dirExistsSynch(lib)) {
    console.log("Directory", lib, "does not exist, creating...");
    fs.mkdirSync(lib);
    console.log("Directory", lib, "created");
}

if (dirExistsSynch(dst)) {
    console.log("Directory", dst, "already exists, removing...");
    rmSync(dst);
    console.log("Directory", dst, "removed");
}

console.log("Copying", src, "Into", dst, "...");
cpSync(src, dst);
console.log(src, "Copied into", dst);

exit(0);
