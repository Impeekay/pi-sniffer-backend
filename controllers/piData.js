"use strict";
const fs = require("fs");
const moment = require("moment");
const util = require("util");

const readFile = util.promisify(fs.readFile);

let filePath = "./data/";

//Get last few line contents which are recent and send them
const getLatestFileContent = async (req, res, next) => {
  try {
    const fileName =
      req.query.fileName ||
      moment()
        .startOf("hour")
        .toISOString();
    let fileContent = await readFile(`${filePath}${fileName}`, "utf8");
    fileContent = fileContent.split("\n");
    fileContent = fileContent.slice(-11); //send back only the last 10 entries
    fileContent.pop(); //remove the last element which is empty string ""
    res.json({ fileName, fileContent });
  } catch (error) {
    res.json({ error: error });
  }
};

module.exports = { getLatestFileContent };
