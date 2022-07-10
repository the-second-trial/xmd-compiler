import { JsonPayload } from "xmdparser/src/resource_image";

export interface ParseRequest {
    source: string;
    inputPackage: JsonPayload;
    template: string;
}

export interface ParseResponse {
    outputImage: JsonPayload;
}

export interface PingRequest {
}

export interface PingResponse {
    reply: string,
}
