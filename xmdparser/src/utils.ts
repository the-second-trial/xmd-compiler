/**
 * Waits for the specified amount of milliseconds.
 * @param ms The time to wait in milliseconds.
 * @returns A promise.
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
