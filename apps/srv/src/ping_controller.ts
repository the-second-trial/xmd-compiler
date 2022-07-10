import { PingRequest, PingResponse } from "./data_contracts";

/** Controller for pinging. */
export class PingController {
    /**
     * Handles a PING request.
     * @param req 
     * @returns 
     */
    public ping(req: PingRequest): PingResponse {
        return {
            reply: "pong",
        };
    }
}
