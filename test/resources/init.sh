#!/bin/sh

# cerating files
touch /tmp/foo

# writing a valid yml file
cat <<'ADDTEXT' > /tmp/foo
findme
ADDTEXT

# setting file permission to 444
chmod 666 /tmp/foo

# writing a valid json file
cat <<'ADDTEXT' > /tmp/foo.json
{
  "a": "b",
  "c": "d"
}
ADDTEXT

# writing a valid yml file
cat <<'ADDTEXT' > /tmp/foo.yml
- foo:
    a: "b"
ADDTEXT

# writing app.js file
cat <<'ADDTEXT' > /tmp/app.js
const http = require('http');

const port = 8080;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
});

server.listen({port}, () => {
    console.log(`Started Application http://localhost:${port}/`);
});
ADDTEXT
