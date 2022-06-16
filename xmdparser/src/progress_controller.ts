import { MultiBar, SingleBar, Presets } from "cli-progress";

export interface ProgressUpdater {
    /**
     * Initializes all bars.
     * This will cause bars to appear at their initial state.
     */
    initialize(): void;

    /**
     * Updates the state of the progress bar relative to the "parse" phase.
     * @param value The new value.
     * @param info Extra info on status.
     */
    updateStateOfParse(value: number, info?: string): void;

    /**
     * Updates the state of the progress bar relative to the "generate" phase.
     * @param value The new value.
     * @param info Extra info on status.
     */
    updateStateOfGenerate(value: number, info?: string): void;

    /**
     * Completes the progress bars causing them to stop and release.
     */
    complete(): void;
}

/** Handles progress display. */
export abstract class ProgressController {
    private static _instance: ProgressUpdater;

    /** Gets the singleton instance of the controller. */
    public static get instance(): ProgressUpdater {
        if (!ProgressController._instance) {
            ProgressController._instance = new ConsoleProgressController();
        }

        return ProgressController._instance;
    }

    /** Sets the singleton instance of the controller. */
    public static set(value: ProgressUpdater): void {
        ProgressController._instance = value;
    }
}

export class ConsoleProgressController implements ProgressUpdater {
    private multibar: MultiBar;
    private parseBar: SingleBar;
    private generateBar: SingleBar;

    constructor() {
        this.multibar = new MultiBar({
            clearOnComplete: false,
            hideCursor: true
        
        }, Presets.shades_grey);
    }

    /** @inheritdoc */
    public initialize(): void {
        this.parseBar = this.multibar.create(100, 0, "Parsing");
        this.generateBar = this.multibar.create(100, 0, "Generate");
    }

    /** @inheritdoc */
    public updateStateOfParse(value: number, info?: string): void {
        this.parseBar.update(value, info ? { "Parsing": info } : undefined);
    }

    /** @inheritdoc */
    public updateStateOfGenerate(value: number, info?: string): void {
        this.generateBar.update(value, info ? { "Generate": info } : undefined);
    }

    /** @inheritdoc */
    public complete(): void {
        this.multibar.stop();
    }
}

export class VoidProgressController implements ProgressUpdater {
    /** @inheritdoc */
    public initialize(): void {
    }

    /** @inheritdoc */
    public updateStateOfParse(value: number, info?: string): void {
    }

    /** @inheritdoc */
    public updateStateOfGenerate(value: number, info?: string): void {
    }

    /** @inheritdoc */
    public complete(): void {
    }
}
