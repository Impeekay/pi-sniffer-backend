"use strict";
const fs = require("fs");
const moment = require("moment");
const util = require("util");

const readFile = util.promisify(fs.readFile);

let filePath = "./data/";

//Get last few line contents which are recent and send them
const getLatestFileContent = async (req, res, next) => {
  try {
    const numberOfLines = req.query.numberOfLines || 11; // get number of lines to send back from the request, if not sent default it to 11
    const fileName =
      req.query.fileName ||
      moment()
        .startOf("day")
        .toISOString();
    let fileContent = await readFile(`${filePath}${fileName}`, "utf8");
    fileContent = fileContent.split("\n");
    fileContent = fileContent.slice(numberOfLines); //send back only the last 10 entries or requested number of lines in the request
    fileContent.pop(); //remove the last element which is empty string ""
    res.json({ fileName, fileContent });
  } catch (error) {
    res.status(404).json({ error: "Requested file does not exist" });
  }
};

module.exports = { getLatestFileContent };
