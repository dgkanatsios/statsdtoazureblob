import * as Azure from "@azure/storage-blob";
import * as os from "os";
import { EventEmitter } from "events";

let containerClient: Azure.ContainerClient;

// these env variables should be defined
// BLOB_ACCOUNT
// BLOB_ACCOUNT_KEY
// REQ_HOSTNAME
// BLOB_CONTAINER_NAME

exports.init = async function (startup_time: string, config: Object, events: EventEmitter) {
    if (!startup_time || !config || !events) throw "(startup_time|config|events) undefined";

    validateAndSetDefaultEnvVariables();

    const account = process.env.BLOB_ACCOUNT as string;
    const accountKey = process.env.BLOB_ACCOUNT_KEY as string;
    const sharedKeyCredential = new Azure.SharedKeyCredential(account, accountKey);

    const blobServiceClient = new Azure.BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        sharedKeyCredential
    );

    const containerName = process.env.BLOB_CONTAINER_NAME as string;

    containerClient = blobServiceClient.getContainerClient(containerName);
    if (!await containerExistsAsync(containerName, blobServiceClient)) {
        await containerClient.create();
        console.log(`Container ${containerName} created`);
    }
    else {
        console.log(`Container ${containerName} exists`);
    }

    events.on("flush", onFlush);
    return true;
};

async function onFlush(timestamp: string, metrics: Object) {
    const content = `${timestamp} ${JSON.stringify(metrics)}\n`;
    const blobName = `${process.env.REQ_HOSTNAME}-${getDate()}.txt`;

    const blobClient = containerClient.getBlobClient(blobName);
    const appendBlobClient = blobClient.getAppendBlobClient();
    if (!await appendBlobExistsAsync(blobName, containerClient)) {
        await appendBlobClient.create();
        console.log(`AppendBlob ${blobName} created`);
    }
    else {
        console.log(`AppendBlob ${blobName} exists`);
    }

    await appendBlobClient.appendBlock(content, content.length);
    console.log(`Uploaded block blob ${blobName} successfully`);
}


async function containerExistsAsync(containerName: string, blobServiceClient: Azure.BlobServiceClient): Promise<boolean> {
    const containers = blobServiceClient.listContainers({ prefix: containerName });
    for await (const container of containers) {
        if (container.name === containerName) {
            return true;
        }
    }
    return false;
}

async function appendBlobExistsAsync(appendBlobName: string, containerServiceClient: Azure.ContainerClient): Promise<boolean> {
    const blobs = containerServiceClient.listBlobsFlat({ prefix: appendBlobName });
    for await (const blob of blobs) {
        if (blob.name === appendBlobName) {
            return true;
        }
    }
    return false;
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

function pad2(n: number): string {
    return (n < 10 ? '0' : '') + n;
}

function getDate(): string {
    const d = new Date();
    return d.getFullYear() +
        pad2(d.getMonth() + 1) +
        pad2(d.getDate());
}