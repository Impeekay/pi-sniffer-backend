"use strict";
const fs = require("fs");
const moment = require("moment");
const util = require("util");

const { Wifi, Camera } = require("../models");
const { Op } = require("sequelize");

const readFile = util.promisify(fs.readFile);

let filePath = "./data/";

//Get last few line contents which are recent and send them
const getLatestFileContent = async (req, res, next) => {
  try {
    const numberOfLines = req.query.numberOfLines || 11; // get number of lines to send back from the request, if not sent default it to 11
    const fileName = req.query.fileName ||
      moment().startOf("day").toISOString();
    let fileContent = await readFile(`${filePath}${fileName}`, "utf8");
    fileContent = fileContent.split("\n");
    //slice takes start and end index
    fileContent = fileContent.slice(0, numberOfLines); //send back only the last 10 entries or requested number of lines in the request
    fileContent.pop(); //remove the last element which is empty string "" after slice
    res.json({ fileName, fileContent });
  } catch (error) {
    res.status(404).json({ error: "Requested file does not exist" });
  }
};

const getLatestProbesFromDb = async (req, res, next) => {
  try {
    const startTime = moment(req.query.startTime).toDate() ||
      moment().startOf("day").toDate();
    const endTime = moment().toDate();
    let probes = await Wifi.findAll({
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
      where: {
        timestamp: {
          [Op.gte]: startTime,
          [Op.lte]: endTime,
        },
        limit: 50,
      },
    });
    if (probes.length !== 0) {
      return res.json({ probes });
    }
    res.json({ error: "No probes" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// const getCameraDetections = async (req, res, next) => {
//   try {
//     const startTimeInterval =
//       moment(req.query.startTimeInterval).toDate() ||
//       moment().subtract(5, "minutes").toDate();
//     const endTimeInterval =
//       moment(req.query.endTimeInterval).toDate() || moment().toDate();
//     let detections = await Camera.findAll({
//       attributes: { exclude: ["id", "createdAt", "updatedAt", "deviceMacId"] },
//       where: {
//         timestamp: {
//           [Op.gte]: startTimeInterval,
//           [Op.lt]: endTimeInterval,
//         },
//       },
//     });
//     if (detections.length !== 0) {
//       return res.json({ detections });
//     }
//     res.json({ detections: [] });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

module.exports = {
  getLatestFileContent,
  getLatestProbesFromDb,
  // getCameraDetections,
};
