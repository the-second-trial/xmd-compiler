import { dirname } from "path";
import { existsSync, mkdirSync } from "fs";

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

/**
 * Truncates a string in the middle.
 * @param input The string to truncate.
 * @param limit The length limit.
 * @returns The truncated string.
 */
export function truncate(input: string, limit = 50): string {
    return input.length > limit
        ? `${input.substring(0, Math.floor(limit/2))}...${input.substring(input.length - Math.floor(limit/2))}`
        : input;
}

/**
 * Ensurea a path to folder exists.
 * @param path The path to a folder.
 */
export function ensurePathToDirExists(path: string): void {
    if (existsSync(path)) {
        return;
    }
    
    ensurePathToDirExists(dirname(path));
    mkdirSync(path);
}
