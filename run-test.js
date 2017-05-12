const http = require('http');
const urlParser = require('url');
const path = require('path');
const fs = require('fs');
const currentDir = __dirname;

http.createServer((request, response) => {
    let urlObject = urlParser.parse(request.url, true),
        pathname = decodeURIComponent(urlObject.pathname),
        filePath = path.join(currentDir, pathname);
    if (filePath.indexOf(pathname) !== -1 && (path.extname(pathname) in {'.js': '', '.html': '', '.css': '', '.json': '' }) && fs.existsSync(filePath)) {
         response.writeHead(200, {});
         response.end(fs.readFileSync(filePath, {encoding: 'utf8'}));
    } else {
         response.writeHead(404, {});
         response.end('File not found!');
    }
}).listen(8849);


let { init } = require('karma-event-driver-ext');
let server = init({
    onExit: (exitCode) => {
        console.log('exitCode',  exitCode);
    }
});