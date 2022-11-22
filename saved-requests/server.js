const express = require("express");
const {appendFile} = require("fs/promises");
const path = require("path");

const server = express();

server.use(express.json());

server.post("/", async (req, res) => {
	const n = Date.now();
	const s = JSON.stringify(req.body);
	console.log(n, s);
	await appendFile(path.resolve(__dirname, "requests3.log"), `${n} ${s}\n`);
	res.status(200).end();
});

server.listen(80);
