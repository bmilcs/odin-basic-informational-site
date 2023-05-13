require("dotenv").config();
const http = require("http");
const fsp = require("fs/promises");
const path = require("path");
const myLogger = require("./logger");

const server = http.createServer(async (req, res) => {
  myLogger.emit("log", `Request received for URL: "${req.url}"`);

  // create full path of the requested page
  const filePath = path.join(
    __dirname,
    "html",
    req.url === "/" ? "index.html" : `${req.url}.html`,
  );

  // retrieve file & send response
  try {
    const pageData = await fsp.readFile(filePath, "utf-8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(pageData);
    myLogger.emit(
      "log",
      `Requested page successfully sent to client: "${filePath}"`,
    );
  } catch (pageError) {
    const isFileNotFound = pageError.code === "ENOENT";
    if (isFileNotFound) {
      myLogger.emit("error", `File not found: "${filePath}"`);
      try {
        const errorPagePath = path.join(__dirname, "html", "404.html");
        const errorPageData = await fsp.readFile(errorPagePath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(errorPageData);
        myLogger.emit("log", "404 Page sent to client.");
      } catch (errorPageError) {
        res.writeHead(500);
        res.end(`Server error: "${errorPageError.code}"`);
        myLogger.emit(
          "error",
          `Server error: "${errorPageError.code}" (404 file read failure)`,
        );
      }
    } else {
      res.writeHead(500);
      res.end(`Server error: ${pageError.code}`);
      myLogger.emit(
        "error",
        `Server-related error: "${pageError.code}" (Requested file read failure)`,
      );
    }
  }

  myLogger.emit("log", "Request handling complete.");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  myLogger.emit("log", `Server launched on port: ${PORT}`);
});
