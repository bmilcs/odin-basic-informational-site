require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const myLogger = require("./logger");

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  myLogger.emit("log", `Request received on URL: ${req.url}`);

  // create full path of the requested page
  const filePath = path.join(
    __dirname,
    "html",
    req.url === "/" ? "index.html" : req.url,
  );

  // read the file path
  fs.readFile(filePath, "utf-8", (pageError, pageData) => {
    if (pageError) {
      // something went wrong with the original read file
      const isFileNotFound = pageError.code === "ENOENT";

      if (isFileNotFound) {
        myLogger.emit("error", `File not found: ${req.url}`);

        const errorPagePath = path.join(__dirname, "html", "404.html");
        fs.readFile(errorPagePath, "utf-8", (errorPageError, errorPageData) => {
          // error page not found:
          if (errorPageError) {
            myLogger.emit("error", "404 Page Not Found");
            throw errorPageError;
          }

          // display error page:
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(errorPageData);
        });
      } else {
        // server error: display it on page
        res.writeHead(500);
        res.end(`Server error: ${pageError.code}`);
      }
    } else {
      // read file succeeded:
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(pageData);
    }
  });
});

server.listen(PORT, HOST, () => {
  myLogger.emit("log", `Server launched on port: ${HOST}:${PORT}`);
});
