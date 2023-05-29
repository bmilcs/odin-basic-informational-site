require("dotenv").config();
const fs = require("fs");
const path = require("path");
const myLogger = require("./logger");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(logIncomingRequest);
app.use(sendFileIfExists);
app.use(handleErrors);

app.listen(port, function appStarted() {
  myLogger.emit("log", `Server launched on port: ${port}`);
});

function logIncomingRequest(req, res, next) {
  myLogger.emit("log", `Request received for URL: "${req.url}"`);
  next();
}

function sendFileIfExists(req, res, next) {
  const filePath = path.join(
    __dirname,
    "html",
    req.url === "/" ? "index.html" : `${req.url}.html`,
  );

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) next({ status: 404, filePath });
    else {
      myLogger.emit(
        "log",
        `Requested page successfully sent to client: "${filePath}"`,
      );
      res.send(data);
    }
  });
}

function handleErrors(err, req, res, next) {
  const statusCode = err.status || 500;
  const filePath = err.filePath;

  myLogger.emit(
    "error",
    `Failed to send requested page to client:
    Error "${statusCode}"
    Path: "${filePath}"`,
  );

  if (statusCode === 404) {
    const errorPagePath = path.join(__dirname, "html", "404.html");
    res.status(statusCode).sendFile(errorPagePath);
  } else {
    res.status(statusCode).send(`Server error: "${statusCode}"`);
  }
}
