import axios, { AxiosResponse } from "axios";
import https from "https";
import { AxiosRequestConfig } from "axios";
import fs from "fs";

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

const pathStore = "/home/adam/workspace/foxy/store/";

setInterval(() => searchToDo(), 100);

function searchToDo() {
  fs.readdir(pathStore + "lock", (err, files) => {
    files.forEach((file) => {
      console.log(file.toString());
      downloadData(pathStore + file.toString() + "/");
      fs.unlink(pathStore + "lock/" + file.toString(), (erro) => {
        if (erro) throw erro;
        console.log(" was deleted");
      });
    });
  });
}

const host = "https://upload.wikimedia.org//";

function readFromFile(pathStoreUuid: string): FoxyQuery {
  const rawdata = fs.readFileSync(pathStoreUuid + "req/input.json");
  const student: FoxyQuery = JSON.parse(rawdata.toString());
  console.log(student);

  return student;
}
function downloadData(fileQueryPath: string) {
  const query: FoxyQuery = readFromFile(fileQueryPath);
  loadData(createQuery(query), fileQueryPath);
}

function createQuery(query: FoxyQuery): AxiosRequestConfig {
  const req: AxiosRequestConfig = {
    url: host + query.params[0],
    method: query.method,
    params: query.query,
    headers: query.headers,
    responseType: "arraybuffer",
  };
  console.log(req);
  return req;
}

function loadData(req: AxiosRequestConfig, pathReq: string) {
  instance.request(req).then(
    (response) => {
      console.log("---------------------response");
      // console.log(JSON.stringify(response.data));
      saveDataToOutput(response, pathReq);
    },
    (error) => {
      console.log("---------------------error");
      console.log(error);
    }
  );
}

function saveDataToOutput(res: AxiosResponse<any, any>, pathReq: string): void {
    console.log( res.config);
    const output = { status: res.status, headers: res.headers };
  fs.mkdirSync(pathReq + "/res", { recursive: true });
  fs.writeFile(pathReq + "res/output.json", JSON.stringify(output), (err) => {
    if (err) throw err;
    console.log("complete");
  });
  fs.writeFile(pathReq + "res/data.bin", res.data, (err) => {
    if (err) throw err;
    console.log("complete");
  });
  fs.writeFile(pathReq + "res/OK", JSON.stringify(res.statusText), (err) => {
    if (err) throw err;
    console.log("complete ok");
  });
}
