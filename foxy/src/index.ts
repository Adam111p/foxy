import express from "express";

import fs from "fs";
import { v4 as uuidv4 } from "uuid";
const app = express();
const port = 8080; // default port to listen
const store = "store";

const timeOut = 10000;
// define a route handler for the default home page
app.get("/*", (req, res) => {
  delete req.headers.referer;
  delete req.headers.host;
  console.log(req.params);
  console.log(req.body);
  console.log(req.headers);
  console.log(req.method);
  console.log(req.query);
  console.log("-------------");
  const pathReq = saveReqToFile(req);

  waitingForResponse(pathReq, res);
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

function genPath() {
  const uuid = uuidv4();
  const pathStoreUuid = store + "/" + uuid;
  fs.mkdirSync(pathStoreUuid + "/req", { recursive: true });
  console.log(pathStoreUuid);
  return { path: pathStoreUuid, uuid };
}

function lockQuery(uuid: string) {
  fs.mkdirSync(store + "/lock", { recursive: true });
  fs.writeFile(store + "/lock/" + uuid, "", (err) => {
    if (err) throw err;
    console.log("complete");
  });
}

function saveReqToFile(req: any): string {
  const r: FoxyQuery = {
    params: req.params,
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  const pathReq = genPath();
  fs.writeFile(pathReq.path + "/req/input.json", JSON.stringify(r), (err) => {
    if (err) throw err;
    console.log("complete");
  });
  lockQuery(pathReq.uuid);
  return pathReq.path;
}

function readDataOutput(pathReq: string): Buffer {
  const rawdata: Buffer = fs.readFileSync(pathReq + "/res/data.bin");
  return rawdata;
}
function readOutputMeta(pathReq: string): object {
  const rawdata = fs.readFileSync(pathReq + "/res/output.json").toString();
  return JSON.parse(rawdata);
}

async function waitingForResponse(pathReq: string, res: any) {
  let count = 0;
  while (count <= timeOut) {
    await sleep(10);
    if (fs.existsSync(pathReq + "/res/OK")) {
      console.log("response exist!");
      const meta: any = readOutputMeta(pathReq);
      console.log(meta);
      res.header(meta.headers).send(readDataOutput(pathReq));
      return "OK";
    }
    count = +10;
  }
  return "TIMEOUT";
}
const sleep = (ms: number) =>
  new global.Promise((resolve) => setTimeout(resolve, ms));
