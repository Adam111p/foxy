"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
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
    const uuid = (0, uuid_1.v4)();
    const pathStoreUuid = store + "/" + uuid;
    fs_1.default.mkdirSync(pathStoreUuid + "/req", { recursive: true });
    console.log(pathStoreUuid);
    return { path: pathStoreUuid, uuid };
}
function lockQuery(uuid) {
    fs_1.default.mkdirSync(store + "/lock", { recursive: true });
    fs_1.default.writeFile(store + "/lock/" + uuid, "", (err) => {
        if (err)
            throw err;
        console.log("complete");
    });
}
function saveReqToFile(req) {
    const r = {
        params: req.params,
        body: req.body,
        headers: req.headers,
        method: req.method,
        query: req.query,
    };
    const pathReq = genPath();
    fs_1.default.writeFile(pathReq.path + "/req/input.json", JSON.stringify(r), (err) => {
        if (err)
            throw err;
        console.log("complete");
    });
    lockQuery(pathReq.uuid);
    return pathReq.path;
}
function readDataOutput(pathReq) {
    const rawdata = fs_1.default.readFileSync(pathReq + "/res/data.bin");
    return rawdata;
}
function readOutputMeta(pathReq) {
    const rawdata = fs_1.default.readFileSync(pathReq + "/res/output.json").toString();
    return JSON.parse(rawdata);
}
function waitingForResponse(pathReq, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        while (count <= timeOut) {
            yield sleep(10);
            if (fs_1.default.existsSync(pathReq + "/res/OK")) {
                console.log("response exist!");
                const meta = readOutputMeta(pathReq);
                console.log(meta);
                res.header(meta.headers).send(readDataOutput(pathReq));
                return "OK";
            }
            count = +10;
        }
        return "TIMEOUT";
    });
}
const sleep = (ms) => new global.Promise((resolve) => setTimeout(resolve, ms));
