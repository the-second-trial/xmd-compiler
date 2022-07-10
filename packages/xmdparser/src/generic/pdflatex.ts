import { dirname, resolve } from "path";
import { execFileSync } from "child_process";

export class PdfLatexRunner {
    constructor(
        private pathToExec: string
    ) {
    }

    public run(inputFilePath: string): void {
        const fullPathToExec = resolve(this.pathToExec);
        const fullInputFilePath = resolve(inputFilePath);

        execFileSync(
            fullPathToExec,
            [
                `-output-directory=${dirname(fullInputFilePath)}`,
                fullInputFilePath,
            ],
            {
                encoding: "utf8",
            }
        );
    }
}
