"use strict";
const moment = require("moment");
// const PiData = require("../models/piData");
const fs = require("fs");

let filePath = "./data/";
let fileStream = fs.createWriteStream(
  `${filePath}${moment()
    .startOf("day")
    .toISOString()}`,
  { flags: "a" }
); //handler used to write to the file (initially setup with the file of that day)

const saveFrameDataToDb = frameData => {
  return new Promise(async (resolve, reject) => {
    try {
      const directedProbes = frameData.frame.probes.directed;
      const nullProbes = frameData.frame.probes.null;
      if (directedProbes.length != 0) {
        //Convert each timestamp to a date object so queries to mongo is easier
        directedProbes.forEach(probe => {
          probe.timestamp = moment(
            probe.timestamp,
            "YYYY-MM-DDTHH:mm:ssZ"
          ).toDate();
        });
      }
      if (nullProbes.length != 0) {
        //Convert each timestamp to a date object so queries to mongo is easier
        nullProbes.forEach(probe => {
          probe.timestamp = moment(
            probe.timestamp,
            "YYYY-MM-DDTHH:mm:ssZ"
          ).toDate();
        });
      }
      //Get the split bucketed document into the db by the hour //TODO: change to day
      const insertPiDataFrame = await PiData.findOneAndUpdate(
        {
          time: moment()
            .startOf("hour")
            .toDate()
        },
        {
          $push: {
            directed: { $each: directedProbes },
            null: { $each: nullProbes }
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.log("Error while inserting frame to DB " + error);
    }
  });
};

const _fileExists = fileName => {
  return new Promise((resolve, reject) => {
    fs.access(`${filePath}${fileName}`, fs.constants.F_OK, err => {
      if (err) {
        return resolve(false); //if file does not exist resolve with false instead of reject
      }
      resolve(true);
    });
  });
};

const _checkIfFileExistsAndCreateIfNot = async fileName => {
  try {
    let exists = await _fileExists(fileName);
    if (exists) {
      //do nothing
      return;
    }
    fileStream.close();
    fileStream = null; //reference it to null to ensure the reference to previous file is removed
    fileStream = fs.createWriteStream(`${filePath}${fileName}`, { flags: "a" }); // to update if a new file needs to be created
  } catch (error) {
    console.log("error while checkIfFileExistsAndCreateIfNot" + error);
  }
};

const saveFrameDataToFile = frameData => {
  return new Promise(async (resolve, reject) => {
    try {
      // const fileName = moment()
      //   .startOf("hour")
      //   .toISOString();
      const fileName = moment(frameData.timestamp, "YYYY-MM-DDTHH:mm:ssZ")
        .startOf("day")
        .toISOString();
      const waitForFileStreamInitialization = await _checkIfFileExistsAndCreateIfNot(
        fileName
      ); // just waiting to create a filestream incase of a new stream or updating the handler incase of a new handler for a change in time

      //Get the split bucketed document into the file named by the hour
      const insertPiDataFrame = await fileStream.write(
        JSON.stringify(frameData) + "\n"
      ); //Write to the named fileStream
    } catch (error) {
      console.log("Error while inserting frame to file " + error);
    }
  });
};

module.exports = { saveFrameDataToDb, saveFrameDataToFile };
