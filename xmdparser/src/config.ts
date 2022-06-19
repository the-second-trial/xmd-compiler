import * as args from "command-line-args";

export interface Config {
    debug?: boolean;
    noserver?: boolean;
    src?: string;
    output?: string;
    template?: string;
    pdfLatexPath?: string;
}

export function getConfigFromCommandLineArgs(argv: Array<string>): Config {
    let { debug, noserver, src, output, template, pdfLatexPath } = args([
        { name: "debug", alias: "d", type: Boolean },
        { name: "noserver", alias: "n", type: Boolean },
        // Path to the XMD/MD file
        { name: "src", type: String, defaultOption: true },
        // Path to directory (must exist) where the output directory is going to be created
        { name: "output", alias: "o", type: String },
        { name: "template", alias: "t", type: String },
        { name: "pdfLatexPath", alias: "p", type: String },
    ], { argv });

    debug = debug || false;
    noserver = noserver || false;

    return {
        debug,
        noserver,
        src,
        output,
        template,
        pdfLatexPath,
    };
}
