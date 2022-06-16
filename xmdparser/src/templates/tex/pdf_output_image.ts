import { join } from "path";

import { PdfLatexRunner } from "../../generic/pdflatex";
import { FileSystemOutputImage } from "../../resource_image";

export class PdfOutputImage extends FileSystemOutputImage {
    constructor(
        private pathToPdfLatex: string,
        imageName: string,
        dirPath: string,
        overwrite = true
    ) {
        super(imageName, dirPath, overwrite);
    }

    /** @inheritdoc */
    public serialize(): void {
        super.serialize();

        // Generate PDF
        // See TexRenderer: assumption is on main tex file to be created
        new PdfLatexRunner(this.pathToPdfLatex).run(join(this.dstDirPath, "main.tex"));
    }
}
