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
            {
                test: /\.pegjs$/i,
                use: 'raw-loader',
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js", ".pegjs"],
    },
    output: {
        filename: "xmdcli.js",
        path: path.resolve(__dirname, "lib"),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    devtool: "cheap-source-map",
};