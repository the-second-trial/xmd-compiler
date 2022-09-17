const path = require("path");

module.exports = {
    entry: "./index.ts",
    target: "node",
    module: {
        rules: [
            {
                test: /\.def$/i,
                type: "asset/resource",
            },
            {
                test: /\.cls$/i,
                type: "asset/resource",
            },
            {
                test: /\.bst$/i,
                type: "asset/resource",
            },
            {
                test: /\.css$/i,
                type: "asset/resource",
            },
            {
                test: /\.js$/i,
                type: "asset/resource",
            },
            {
                test: /\.json$/i,
                type: "asset/resource",
            },
            {
                test: /\.woff$/i,
                type: "asset/resource",
            },
            {
                test: /\.eot$/i,
                type: "asset/resource",
            },
            {
                test: /\.ttf$/i,
                type: "asset/resource",
            },
            {
                test: /\.svg$/i,
                type: "asset/resource",
            },
            {
                test: /\.map$/i,
                type: "asset/resource",
            },
            {
                test: /\.html$/i,
                type: "asset/resource",
            },
        ],
    },
    resolve: {
        extensions: [".ts"],
    },
    output: {
        filename: "xmdparser.js",
        library: "xmdparser",
        libraryTarget: "umd",
        path: path.resolve(__dirname, "lib"),
    },
};