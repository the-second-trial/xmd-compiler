const path = require("path");

module.exports = {
    entry: "./index.ts",
    target: "node",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "xmdsrv.js",
        path: path.resolve(__dirname, "lib"),
    }
};