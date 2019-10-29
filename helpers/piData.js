'use strict'
const moment = require('moment')
const PiData = require('../models/pidata')

const saveFrameDataToDb = (frameData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const directedProbes = frameData.frame.probes.directed
            const nullProbes = frameData.frame.probes.null
            if (directedProbes.length != 0) {
                //Convert each timestamp to a date object so queries to mongo is easier
                directedProbes.forEach(probe => {
                    probe.timestamp = moment(probe.timestamp, 'YYYY-MM-DDTHH:mm:ss').toDate()
                });
            }
            if (nullProbes.length != 0) {
                //Convert each timestamp to a date object so queries to mongo is easier
                nullProbes.forEach(probe => {
                    probe.timestamp = moment(probe.timestamp, 'YYYY-MM-DDTHH:mm:ssZ').toDate()
                });
            }
            //Get the split bucketed document into the db by the hour
            const insertPiDataFrame = await PiData.findOneAndUpdate({
                time: moment().startOf('hour').toDate()
            }, { $push: { directed: { $each: directedProbes }, null: { $each: nullProbes } } }, { upsert: true })

        } catch (error) {
            console.log("Error while inserting frame to DB " + error)
        }
    })
}

module.exports = { saveFrameDataToDb }