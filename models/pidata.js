"use strict";

// const mongoose = require('mongoose');
const db = require("../singletons/db");
const Schema = require("mongoose").Schema;

//Pi Data schema

const piDataSchema = new Schema(
  {
    //time will be used as buckets like every day or hourly like 29th to 30th one bucket or 1am to 2 am bucket etc.
    time: {
      type: Date,
      required: true,
      default: new Date()
    },
    directed: {
      type: [Schema.Types.Mixed],
      default: []
    },
    null: {
      type: [Schema.Types.Mixed],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = db.model("PiData", piDataSchema);
