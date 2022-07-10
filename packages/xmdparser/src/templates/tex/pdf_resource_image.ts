import { join, resolve } from "path";

import { PdfLatexRunner } from "../../generic/pdflatex";
import { ResourceImage, serializeResourceImageToFileSystem } from "../../resource_image";

export function serializeResourceImageToPdfFileSystem(image: ResourceImage, pathToPdfLatex: string, dirPath: string, overwrite = true): void {
    serializeResourceImageToFileSystem(image, dirPath, overwrite);

    // Generate PDF
    // See TexRenderer: assumption is on main tex file to be created
    new PdfLatexRunner(pathToPdfLatex).run(join(resolve(dirPath), "main.tex"));
}
