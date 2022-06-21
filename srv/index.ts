import * as express from "express";

const app = express();
const port = 3000;
const pysrvPort = 4000;

app.post("/", async (req, res) => {
    res.send("My hai beccato");
});

app.listen(port, () => {
    console.log("App ready...");
});
