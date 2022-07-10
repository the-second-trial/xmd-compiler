export interface MathEnvironmentsRenderer {
    writeTheorem(title: string, statement: string, proof: string): string;
}
