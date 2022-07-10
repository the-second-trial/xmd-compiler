/**
 * Entry point.
 */

import { join, dirname, resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { exit } from "process";

import { Constants } from "xmdparser/src/constants";
import { ProgressController } from "xmdparser/src/progress_controller";
import { truncate } from "xmdparser/src/utils";
import { Serializer } from "xmdparser/src/serializer";
import { InputImageFactory } from "xmdparser/src/input_image_factory";
import { serializeResourceImageToJsonPayload, deserializeResourceImageFromJsonPayload } from "xmdparser/src/resource_image";

import { printGenInfo } from "./print";
import { getConfigFromCommandLineArgs } from "./config";
import { HttpClient } from "./http_client";

const current_path = __dirname;

// Configure the commandline args
const config = getConfigFromCommandLineArgs(process.argv);

// Handle defaults
config.src = resolve(config.src || join(current_path, "index.md"));
config.output = resolve(config.output || dirname(config.src));
config.template = config.template || Constants.OutputTypes.HTML_TUFTE;
config.host = config.host || "localhost";
config.port = config.port || 3000;

async function main(): Promise<void> {
    if (!existsSync(config.src)) {
        throw new Error(`Input file '${config.src}' could not be found`);
    }

    console.log(printGenInfo(config.template));
    console.info(`${truncate(config.src)} => ${truncate(config.output)}`);

    const source = readFileSync(config.src).toString("utf8");

    ProgressController.instance.initialize();

    try {
        // Contact the server
        const httpClient = new HttpClient(config.host, config.port);

        const pingResponse = await httpClient.ping({});
        if (pingResponse.reply !== "pong") {
            throw new Error("Service not reachable");
        }

        const inputImage = new InputImageFactory(config.src).create();
        ProgressController.instance.updateStateOfParse(100);

        const parseResponse = await httpClient.parse({
            source,
            template: config.template,
            inputPackage: serializeResourceImageToJsonPayload(inputImage),
        });
        if (typeof parseResponse === "number") {
            throw new Error(`Parse call failed: ${parseResponse}`);
        }
        ProgressController.instance.updateStateOfGenerate(100);

        // Serialize the image
        const outputImage = deserializeResourceImageFromJsonPayload(parseResponse.outputImage);
        new Serializer(config.src, config.output, config.template, config.pdfLatexPath, outputImage).serialize();
    } catch (error) {
        console.error("An error occurred while retrieving the output package from server.", error);
    } finally {
        ProgressController.instance.complete();

        console.log("Done and saved", config.output);
    }
}

main()
    .then(() => {
        exit(0);
    })
    .catch(error => {
        console.error("An error occurred", error);
        exit(1);
    });
