"use strict";
const moment = require("moment");
const { Camera, Wifi } = require("../models");
// const fs = require("fs");

const saveFrameDataToDb = (frameData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const directedProbes = frameData.frame.probes.directed;
      const nullProbes = frameData.frame.probes.null;
      const deviceMacId = frameData.deviceMacID;
      const frameTimeStamp = moment.parseZone(
        frame.timestamp,
        "YYYY-MM-DDTHH:mm:ssZ"
      )._d;
      let insertObjects = [];
      if (directedProbes.length != 0) {
        //iterate over all the directedProbes if not null and create a new frame to be pushed into the db
        directedProbes.forEach((probe) => {
          let insertObject = {
            deviceMacId: deviceMacId,
            directedProbe: probe,
            nullProbe: null,
            timestamp: frameTimeStamp,
          };
          insertObjects.push(insertObject);
        });
      }
      if (nullProbes.length != 0) {
        //iterate over all the nullProbes if not null and create a new frame to be pushed into the db
        nullProbes.forEach((probe) => {
          let insertObject = {
            deviceMacId: deviceMacId,
            nullProbe: probe,
            directedProbe: null,
            timestamp: frameTimeStamp,
          };
          insertObjects.push(insertObject);
        });
      }
      //await for the objects to be inserted to the db
      await Wifi.bulkCreate(insertObjects);
      return resolve(true);
    } catch (error) {
      console.log("Error while inserting frame to DB " + error);
      return reject(error);
    }
  });
};

const saveCameraDetectionsToDb = (frame) => {
  return new Promise(async (resolve, reject) => {
    try {
      const deviceMacId = frame.deviceMacId;
      const detections = frame.detections;
      // console.log(frame.timestamp);
      const timestamp = moment.parseZone(
        frame.timestamp,
        "YYYY-MM-DDTHH:mm:ssZ"
      )._d;
      // console.log(timestamp);
      let cameraDetectionObject = {
        deviceMacId: deviceMacId,
        detections: detections,
        timestamp: timestamp,
      };
      await Camera.create(cameraDetectionObject);
      return resolve(true);
    } catch (error) {
      console.log("Error while inserting camera detections to DB " + error);
      return reject(error);
    }
  });
};

module.exports = { saveFrameDataToDb, saveCameraDetectionsToDb };

//SAVE TO FILE CODE

// let filePath = "./data/";
// let fileStream = fs.createWriteStream(
//   `${filePath}${moment().startOf("day").toISOString()}`,
//   { flags: "a" }
// ); //handler used to write to the file (initially setup with the file of that day)

// const _fileExists = (fileName) => {
//   return new Promise((resolve, reject) => {
//     fs.access(`${filePath}${fileName}`, fs.constants.F_OK, (err) => {
//       if (err) {
//         return resolve(false); //if file does not exist resolve with false instead of reject
//       }
//       resolve(true);
//     });
//   });
// };

// const _checkIfFileExistsAndCreateIfNot = async (fileName) => {
//   try {
//     let exists = await _fileExists(fileName);
//     if (exists) {
//       //do nothing
//       return;
//     }
//     fileStream.close();
//     fileStream = null; //reference it to null to ensure the reference to previous file is removed
//     fileStream = fs.createWriteStream(`${filePath}${fileName}`, { flags: "a" }); // to update if a new file needs to be created
//   } catch (error) {
//     console.log("error while checkIfFileExistsAndCreateIfNot" + error);
//   }
// };

// const saveFrameDataToFile = (frameData) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // const fileName = moment()
//       //   .startOf("hour")
//       //   .toISOString();
//       const fileName = moment(frameData.timestamp, "YYYY-MM-DDTHH:mm:ssZ")
//         .startOf("day")
//         .toISOString();
//       const waitForFileStreamInitialization = await _checkIfFileExistsAndCreateIfNot(
//         fileName
//       ); // just waiting to create a filestream incase of a new stream or updating the handler incase of a new handler for a change in time

//       //Get the split bucketed document into the file named by the hour
//       const insertPiDataFrame = await fileStream.write(
//         JSON.stringify(frameData) + "\n"
//       ); //Write to the named fileStream
//     } catch (error) {
//       console.log("Error while inserting frame to file " + error);
//     }
//   });
// };
