import { JsonPayload, ResourceImage, serializeResourceImageToJsonPayload } from "../xmdparser/src/resource_image";

/** Serializes the output. */
export class RemoteSerializer {
    /**
     * Iitializes a new instance of this class.
     * @param outputImage The output image to serialize.
     */
    constructor(
        private outputImage: ResourceImage
    ) {
    }

    /**
     * Serializes the output.
     */
    public serialize(): JsonPayload {
        return serializeResourceImageToJsonPayload(this.outputImage);
    }
}
