import { MultiBar, SingleBar, Presets } from "cli-progress";

/** Handles progress display. */
export class ProgressController {
    private static _instance: ProgressController;

    private multibar: MultiBar;
    private parseBar: SingleBar;
    private generateBar: SingleBar;

    private constructor() {
        this.multibar = new MultiBar({
            clearOnComplete: false,
            hideCursor: true
        
        }, Presets.shades_grey);
    }

    public static get instance(): ProgressController {
        if (!ProgressController._instance) {
            ProgressController._instance = new ProgressController();
        }

        return ProgressController._instance;
    }

    /**
     * Initializes all bars.
     * This will cause bars to appear at their initial state.
     */
    public initialize(): void {
        this.parseBar = this.multibar.create(100, 0, "Parsing");
        this.generateBar = this.multibar.create(100, 0, "Generate");
    }

    /**
     * Updates the state of the progress bar relative to the "parse" phase.
     * @param value The new value.
     * @param info Extra info on status.
     */
    public updateStateOfParse(value: number, info?: string): void {
        this.parseBar.update(value, info ? { "Parsing": info } : undefined);
    }

    /**
     * Updates the state of the progress bar relative to the "generate" phase.
     * @param value The new value.
     * @param info Extra info on status.
     */
    public updateStateOfGenerate(value: number, info?: string): void {
        this.generateBar.update(value, info ? { "Generate": info } : undefined);
    }

    /**
     * Completes the progress bars causing them to stop and release.
     */
    public complete(): void {
        this.multibar.stop();
    }
}
