import * as express from "express";
import { ProgressController, VoidProgressController } from "../../xmdparser/src/progress_controller";
import { Constants } from "./constants";
import { ParserController, ParseRequest } from "./parser_controller";

const app = express();
app.use(express.json());

const port = 3000;
const pysrvPort = 4000;

// Server wide settings
ProgressController.set(new VoidProgressController());

// Initialize server-wide controllers
const parserController = new ParserController();

/**
 * Method: POST
 * Path: /
 */
app.post("/", async (req, res) => {
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
app.get("/ping", async (req, res) => {
    res.send("pong");
});

app.listen(port, () => {
    console.log("App ready...");
});
