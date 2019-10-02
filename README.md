# statsdtoazureblob

A small output plugin for [statsd](https://github.com/statsd/statsd) that facilitates the ingestion of incoming events to [Azure Storage Append Blob](https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-block-blobs--append-blobs--and-page-blobs#about-append-blobs). Includes a Dockerfile that builds statsd with this plugin on Alpine Linux.

## Installation

### Create an Azure Storage Account

[Instructions](https://docs.microsoft.com/en-us/azure/storage/common/storage-quickstart-create-account?tabs=azure-portal)

### Get Node.js

[Install Node.js on deb platforms](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)

### Get Typescript

```bash
sudo npm install -g typescript
```

### Compile && install

```bash
npm install
npm build # or tsc statsdtoazureblob.ts
# place the generated statsdtoazureblob.js on backends directory of statsd
```

A default statsd `config.js` is provided for your convenience. It's installed in `/etc/statsd/config.js` if you want to override it.

```json
{
    backends: ["../statsdtoazureblob/statsdtoazureblob"]
}
```

To run via Docker, you can use the below command:

```bash
docker run -p 8125:8125/udp -p 8126:8126 \
-e "BLOB_ACCOUNT=<YOUR_BLOB_ACCOUNT>" -e "BLOB_ACCOUNT_KEY=<YOUR_BLOB_ACCOUNT_KEY>" \
-e "REQ_HOSTNAME=$(hostname)" -e "BLOB_CONTAINER_NAME=<YOUR_CONTAINER_NAME>" \
 --net=bridge --name statsd -d dgkanatsios/statsd-alpine:$VERSION

# get the container IP to pass it to the service that will send events to statsd
# if it's a container, it should be on the "bridge" network layer
STATSD_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' statsd)
```

## Docker 

Build

```bash
docker build -t dgkanatsios/statsd-alpine:$VERSION .
docker push dgkanatsios/statsd-alpine:$VERSION

# or

npm run dockerbuild && npm run dockerpush # make sure you change the version on package.json before running this!
```