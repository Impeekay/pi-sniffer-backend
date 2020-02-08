"use strict";
const mqtt = require("mqtt");
const config = require("../configs/config");
const io = require("./socket");
const { saveFrameDataToDb, saveFrameDataToFile } = require("../helpers/piData");
//set the connect options for the mqtt connection
const connectOptions = {
  host: config.mqttHost,
  port: config.mqttPort,
  username: config.mqttUsername,
  password: config.mqttPassword,
  keepalive: 60
};

const mqttclient = mqtt.connect(connectOptions);

//TODO: handle errors and report them somewhere

// Mqtt connect calback
mqttclient.on("connect", function() {
  console.log("Mqtt Client connected to the broker");
  //Now subscribe to the frame topic so that we start getting data (Array of topics)
  mqttclient.subscribe(config.mqttTopics);
});

// Mqtt message calback
mqttclient.on("message", async function(topic, message) {
  // message is Buffer
  try {
    // console.log(message.toString())
    console.log("New message on topic " + topic);
    if (topic === "frame_topic") {
      let messageJson = JSON.parse(message.toString());
      // console.log(messageJson);
      //   saveFrameDataToDb(JSON.parse(message.toString()));
      saveFrameDataToFile(messageJson);
      io.io.emit("newData", messageJson); //after saving to file emit the event to frontend
    } else if (topic === "cache_frame_topic") {
      // console.log(message.toString());
      let messageJson = JSON.parse(message.toString());
      messageJson.cached_frames.length
        ? messageJson.cached_frames.forEach(frame => {
            saveFrameDataToFile(frame);
          })
        : console.log("Nothing to insert in cached_frame message received");
    }
  } catch (error) {
    console.log("Error in on message callback " + error);
  }
});

// Mqtt error calback
mqttclient.on("error", err => {
  console.log("mqtt client error " + err);
});

//Mqtt on close callback
mqttclient.on("close", () => {
  console.log("mqtt client closed/disconnected ");
});
