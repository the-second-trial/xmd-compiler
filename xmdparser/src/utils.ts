/**
 * Waits for the specified amount of milliseconds.
 * @param ms The time to wait in milliseconds.
 * @returns A promise.
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets an ID generator.
 * @param prefix The prefix to use.
 * @returns A unique ID.
 */
export function* idgen(prefix = "id"): Generator<string> {
    let counter = 0;

    while (counter < Number.MAX_SAFE_INTEGER) {
        yield `${prefix}${counter++}`;
    }

    return `${prefix}-end`
}
