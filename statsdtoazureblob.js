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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var Azure = require("@azure/storage-blob");
var os = require("os");
var containerClient;
// these env variables should be defined
// BLOB_ACCOUNT
// BLOB_ACCOUNT_KEY
// REQ_HOSTNAME
// BLOB_CONTAINER_NAME
exports.init = function (startup_time, config, events) {
    return __awaiter(this, void 0, void 0, function () {
        var account, accountKey, sharedKeyCredential, blobServiceClient, containerName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!startup_time || !config || !events)
                        throw "(startup_time|config|events) undefined";
                    validateAndSetDefaultEnvVariables();
                    account = process.env.BLOB_ACCOUNT;
                    accountKey = process.env.BLOB_ACCOUNT_KEY;
                    sharedKeyCredential = new Azure.SharedKeyCredential(account, accountKey);
                    blobServiceClient = new Azure.BlobServiceClient("https://" + account + ".blob.core.windows.net", sharedKeyCredential);
                    containerName = process.env.BLOB_CONTAINER_NAME;
                    containerClient = blobServiceClient.getContainerClient(containerName);
                    return [4 /*yield*/, containerExistsAsync(containerName, blobServiceClient)];
                case 1:
                    if (!!(_a.sent())) return [3 /*break*/, 3];
                    return [4 /*yield*/, containerClient.create()];
                case 2:
                    _a.sent();
                    console.log("Container " + containerName + " created");
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Container " + containerName + " exists");
                    _a.label = 4;
                case 4:
                    events.on("flush", onFlush);
                    return [2 /*return*/, true];
            }
        });
    });
};
function onFlush(timestamp, metrics) {
    return __awaiter(this, void 0, void 0, function () {
        var content, blobName, blobClient, appendBlobClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    content = timestamp + " " + JSON.stringify(metrics) + "\n";
                    blobName = process.env.REQ_HOSTNAME + "-" + getDate() + ".txt";
                    blobClient = containerClient.getBlobClient(blobName);
                    appendBlobClient = blobClient.getAppendBlobClient();
                    return [4 /*yield*/, appendBlobExistsAsync(blobName, containerClient)];
                case 1:
                    if (!!(_a.sent())) return [3 /*break*/, 3];
                    return [4 /*yield*/, appendBlobClient.create()];
                case 2:
                    _a.sent();
                    console.log("AppendBlob " + blobName + " created");
                    return [3 /*break*/, 4];
                case 3:
                    console.log("AppendBlob " + blobName + " exists");
                    _a.label = 4;
                case 4: return [4 /*yield*/, appendBlobClient.appendBlock(content, content.length)];
                case 5:
                    _a.sent();
                    console.log("Uploaded block blob " + blobName + " successfully");
                    return [2 /*return*/];
            }
        });
    });
}
function containerExistsAsync(containerName, blobServiceClient) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var containers, containers_1, containers_1_1, container, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    containers = blobServiceClient.listContainers({ prefix: containerName });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 12]);
                    containers_1 = __asyncValues(containers);
                    _b.label = 2;
                case 2: return [4 /*yield*/, containers_1.next()];
                case 3:
                    if (!(containers_1_1 = _b.sent(), !containers_1_1.done)) return [3 /*break*/, 5];
                    container = containers_1_1.value;
                    if (container.name === containerName) {
                        return [2 /*return*/, true];
                    }
                    _b.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _b.trys.push([7, , 10, 11]);
                    if (!(containers_1_1 && !containers_1_1.done && (_a = containers_1["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(containers_1)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, false];
            }
        });
    });
}
function appendBlobExistsAsync(appendBlobName, containerServiceClient) {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var blobs, blobs_1, blobs_1_1, blob, e_2_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    blobs = containerServiceClient.listBlobsFlat({ prefix: appendBlobName });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 12]);
                    blobs_1 = __asyncValues(blobs);
                    _b.label = 2;
                case 2: return [4 /*yield*/, blobs_1.next()];
                case 3:
                    if (!(blobs_1_1 = _b.sent(), !blobs_1_1.done)) return [3 /*break*/, 5];
                    blob = blobs_1_1.value;
                    if (blob.name === appendBlobName) {
                        return [2 /*return*/, true];
                    }
                    _b.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _b.trys.push([7, , 10, 11]);
                    if (!(blobs_1_1 && !blobs_1_1.done && (_a = blobs_1["return"]))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(blobs_1)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, false];
            }
        });
    });
}
function validateAndSetDefaultEnvVariables() {
    if (!process.env.REQ_HOSTNAME) {
        console.log("REQ_HOSTNAME is not defined, setting it to local hostname");
        process.env.REQ_HOSTNAME = os.hostname();
    }
    if (!process.env.BLOB_ACCOUNT) {
        throw "BLOB_ACCOUNT should be defined";
    }
    if (!process.env.BLOB_ACCOUNT_KEY) {
        throw "BLOB_ACCOUNT_KEY should be defined";
    }
    if (!process.env.BLOB_CONTAINER_NAME) {
        throw "BLOB_CONTAINER_NAME should be defined";
    }
}
function pad2(n) {
    return (n < 10 ? '0' : '') + n;
}
function getDate() {
    var d = new Date();
    return d.getFullYear() +
        pad2(d.getMonth() + 1) +
        pad2(d.getDate());
}
