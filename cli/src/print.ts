import { Constants } from "../../xmdparser/src/constants";

const { EOL } = require("os");

export function printMd2HtmlTufte(): string {
    return [
        "------     ----------------",
        "| MD | ==> | HTML (Tufte) |",
        "------     ----------------",
    ].join(EOL);
}

export function printMd2TexTufte(): string {
    return [
        "------     ---------------",
        "| MD | ==> | TEX (Tufte) |",
        "------     ---------------",
    ].join(EOL);
}

export function printMd2HtmlSlides(): string {
    return [
        "------     -----------------------",
        "| MD | ==> | HTML (Presentation) |",
        "------     -----------------------",
    ].join(EOL);
}

export function printGenInfo(outputType: string): string {
    if (outputType === Constants.OutputTypes.HTML_TUFTE) {
        return printMd2HtmlTufte();
    }

    if (outputType === Constants.OutputTypes.TEX_TUFTE) {
        return printMd2TexTufte();
    }

    if (outputType === Constants.OutputTypes.HTML_SLIDES) {
        return printMd2HtmlSlides();
    }

    return "";
}
