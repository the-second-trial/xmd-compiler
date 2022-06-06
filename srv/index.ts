import * as express from "express";

const app = express();
const port = 3000;

app.post("/", (req, res) => {
    res.send("My hai beccato");
});

app.listen(port, () => {
    console.log("App ready...");
});
