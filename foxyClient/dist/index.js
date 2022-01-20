"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const instance = axios_1.default.create({
    httpsAgent: new https_1.default.Agent({
        rejectUnauthorized: false,
    }),
});
const pathStore = "/home/adam/workspace/foxy/store/";
setInterval(() => searchToDo(), 100);
function searchToDo() {
    fs_1.default.readdir(pathStore + "lock", (err, files) => {
        files.forEach((file) => {
            console.log(file.toString());
            downloadData(pathStore + file.toString() + "/");
            fs_1.default.unlink(pathStore + "lock/" + file.toString(), (erro) => {
                if (erro)
                    throw erro;
                console.log(" was deleted");
            });
        });
    });
}
const host = "https://upload.wikimedia.org//";
function readFromFile(pathStoreUuid) {
    const rawdata = fs_1.default.readFileSync(pathStoreUuid + "req/input.json");
    const student = JSON.parse(rawdata.toString());
    console.log(student);
    return student;
}
function downloadData(fileQueryPath) {
    const query = readFromFile(fileQueryPath);
    loadData(createQuery(query), fileQueryPath);
}
function createQuery(query) {
    const req = {
        url: host + query.params[0],
        method: query.method,
        params: query.query,
        headers: query.headers,
        responseType: "arraybuffer",
    };
    console.log(req);
    return req;
}
function loadData(req, pathReq) {
    instance.request(req).then((response) => {
        console.log("---------------------response");
        // console.log(JSON.stringify(response.data));
        saveDataToOutput(response, pathReq);
    }, (error) => {
        console.log("---------------------error");
        console.log(error);
    });
}
function saveDataToOutput(res, pathReq) {
    console.log(res.config);
    const output = { status: res.status, headers: res.headers };
    fs_1.default.mkdirSync(pathReq + "/res", { recursive: true });
    fs_1.default.writeFile(pathReq + "res/output.json", JSON.stringify(output), (err) => {
        if (err)
            throw err;
        console.log("complete");
    });
    fs_1.default.writeFile(pathReq + "res/data.bin", res.data, (err) => {
        if (err)
            throw err;
        console.log("complete");
    });
    fs_1.default.writeFile(pathReq + "res/OK", JSON.stringify(res.statusText), (err) => {
        if (err)
            throw err;
        console.log("complete ok");
    });
}
