const path = require("path");

module.exports = {
    entry: "./src/index.ts",
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
        filename: "xmdcli.js",
        path: path.resolve(__dirname, "lib"),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    devtool: "cheap-source-map",
};