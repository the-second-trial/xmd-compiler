import * as express from "express";
import { ProgressController, VoidProgressController } from "../xmdparser/src/progress_controller";

const app = express();
const port = 3000;
const pysrvPort = 4000;

// Server wide settings
ProgressController.set(new VoidProgressController());

app.post("/", async (req, res) => {
    res.send("My hai beccato");
});

app.listen(port, () => {
    console.log("App ready...");
});
