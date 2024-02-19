import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import { uploadFile } from "./upload";
import { getAllFiles } from "./getFile";
import path from "path";
import { createClient } from "redis";
const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors())
app.use(express.json());

// POSTMAN
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    files.forEach(async file => {
        console.log(file.slice(__dirname.length + 1));
        let temppath=file.slice(__dirname.length + 1);
        let replacedString =temppath.split('\\').join('/');
        await uploadFile(replacedString, file);
    })

    await new Promise((resolve) => setTimeout(resolve, 5000))
    publisher.lPush("build-queue", id);
    // INSERT => SQL
    // .create => 
    publisher.hSet("status", id, "uploaded");
    res.json({
        id: id
    })
});

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000);