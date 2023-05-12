require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const myLogger = require("./logger");

const server = http.createServer((req, res) => {
  myLogger.emit("log", `Request received on URL: ${req.url}`);

  // create full path of the requested page
  const filePath = path.join(
    __dirname,
    "html",
    req.url === "/" ? "index.html" : `${req.url}.html`,
  );

  // retrieve the contents of the requested file
  fs.readFile(filePath, "utf-8", (pageError, pageData) => {
    if (pageError) {
      // something went wrong with the original read file
      const isFileNotFound = pageError.code === "ENOENT";

      if (isFileNotFound) {
        myLogger.emit("error", `File not found: ${req.url}`);

        const errorPagePath = path.join(__dirname, "html", "404.html");

        fs.readFile(errorPagePath, "utf-8", (errorPageError, errorPageData) => {
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  myLogger.emit("log", `Server launched on port: ${HOST}:${PORT}`);
});
