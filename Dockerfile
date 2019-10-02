FROM mhart/alpine-node:8
WORKDIR /usr/src/app/
COPY sampleconfig.js .
RUN apk --no-cache add python make gcc g++ && \
  npm install statsd@0.8.5 statsdtoazureblob@0.1.9 && \
  apk --purge del python make gcc g++ && \ 
  npm cache clean --force && \
  npm uninstall -y npm && \ 
  mkdir -p /etc/statsd && \
  cp sampleconfig.js /etc/statsd/config.js && \
  rm -rf /var/cache/apk/*
ENTRYPOINT ["/usr/bin/node", "/usr/src/app/node_modules/statsd/stats.js", "/etc/statsd/config.js"]
EXPOSE 8125/udp 8126