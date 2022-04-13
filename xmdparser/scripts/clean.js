const fs = require("fs");
const path = require("path");
const { exit } = require("process");

function dirExistsSynch(src) {
    return fs.existsSync(src) && fs.statSync(src)?.isDirectory();
}

/**
 * Acts like `rm -R`.
 * @param {string} src The path to the directory to remove.
 */
function rmSync(src) {
    fs.rmSync(src, { recursive: true, force: true });

    if (dirExistsSynch(src)) {
        throw new Error(`Directory ${src} still exists after removal`);
    }
}

// Path to the project directory
const root_path = path.resolve(__dirname, "..");
const lib = path.resolve(root_path, "lib");

if (!dirExistsSynch(lib)) {
    console.log("No output directory found, no action");
    exit(0);
}

console.log("Deleting directory", lib, "...");
rmSync(lib);
console.log("Directory", lib, "deleted");

exit(0);
