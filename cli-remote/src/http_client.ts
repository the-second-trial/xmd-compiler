import { PingRequest, PingResponse, ParseRequest, ParseResponse } from "../../srv/src/data_contracts";
import { Constants } from "./constants";

export class HttpClient {
    constructor(
        private host = "localhost",
        private port = 3000
    ) {
    }

    public async parse(req: ParseRequest): Promise<ParseResponse | number> {
        const res = await fetch(`${this.baseAddr}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req),
        });

        if (res.status !== Constants.StatusCodes.HTTP_200_OK) {
            return res.status;
        }

        return await res.json() as ParseResponse;
    }

    public async ping(req: PingRequest): Promise<PingResponse> {
        const res = await fetch(`${this.baseAddr}/ping`, { method: "GET" });
        return await res.json() as PingResponse;
    }

    private get baseAddr(): string {
        return `${this.host}:${this.port}`;
    }
}
