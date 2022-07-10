const { EOL } = require("os");

import { MathEnvironmentsRenderer } from "../../../extensions/renderer_math_environ";

/**
 * Renderer for Math environments in LaTeX.
 */
export class TexMathEnvironmentsRenderer implements MathEnvironmentsRenderer {
    /**
     * Writes a theorem.
     * @param title The title.
     * @param statement The main statement.
     * @param proof The (optional) proof.
     * @returns The rendered theorem.
     */
    public writeTheorem(title: string, statement: string, proof?: string): string {
        if (!proof) {
            return [
                `\\begin{theorem}[${title}]`,
                statement,
                `\\end{theorem}`,
            ].join(EOL);
        }

        return [
            `\\begin{theorem}[${title}]`,
            statement,
            `\\end{theorem}`,
            `\\begin{proof}`,
            proof,
            `\\end{proof}`,
        ].join(EOL) + EOL;
    }
}