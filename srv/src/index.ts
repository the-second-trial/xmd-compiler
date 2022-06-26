import * as express from "express";
import { ProgressController, VoidProgressController } from "../../xmdparser/src/progress_controller";
import { Constants } from "./constants";
import { ParseRequest } from "./data_contracts";
import { ParserController } from "./parser_controller";
import { PingController } from "./ping_controller";

const app = express();
app.use(express.json());

const port = 3000;
const pysrvPort = 4000;

// Server wide settings
ProgressController.set(new VoidProgressController());

// Initialize server-wide controllers
const parserController = new ParserController();
const pingController = new PingController();

/**
 * Method: POST
 * Path: /
 */
app.post("/", async (req, res) => {
    console.log("serving: POST /");

    try {
        const request = req.body as ParseRequest;
        const response = await parserController.parse(request);
    
        if (typeof response === "number") {
            res.sendStatus(response);
            return;
        }
    
        res
            .status(Constants.StatusCodes.HTTP_200_OK)
            .send(response);
    } catch (e) {
        console.error("An error occurred while processing POST /", e);

        res
            .setHeader("X-XMD-ERROR-DESC", `An error occurred: '${e}'`)
            .sendStatus(Constants.StatusCodes.HTTP_500_INTERNAL_SERVER_ERROR);
    }
});

/**
 * Method: GET
 * Path: /ping
 */
app.get("/ping", (req, res) => {
    console.log("serving: GET /ping");

    const response = pingController.ping({});

    res
        .status(Constants.StatusCodes.HTTP_200_OK)
        .send(response);
});

app.listen(port, () => {
    console.log("App ready...");
});
