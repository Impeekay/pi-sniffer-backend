//This is the current raspberry pi's mac id
const deviceMacId = "B827EBF65EA1";
const moment = require("moment");
const fs = require("fs");
const readline = require("readline");
const filePath = "../data/";
const tmpPath = "../newData/";

//open and create a writestream to write the pings to
const csv = fs.createWriteStream(`${tmpPath}postgres.csv`, {
  flags: "a",
});

const readAndProcessFile = function (file) {
  return new Promise(function (resolve, reject) {
    try {
      const rl = readline.createInterface({
        input: fs.createReadStream(file),
      });
      let insertObjects = [];

      rl.on("line", async (line) => {
        //remove all these special characters, since postgres throws an error for this specific unicode character
        line = line.replace(/\\u000/g, " ");
        let frameJson = JSON.parse(line);
        let frameTimestamp = moment(
          frameJson.timestamp,
          "YYYY-MM-DDTHH:mm:ssZ",
        ).format();
        let directed = frameJson.frame.probes.directed;
        let nullProbes = frameJson.frame.probes.null;
        if (directed.length !== 0) {
          directed.forEach((probe) => {
            csv.write(
              `${deviceMacId}|${
                JSON.stringify(
                  JSON.stringify(probe),
                )
              }|${null}|${frameTimestamp}\n`,
            );
          });
        }
        if (nullProbes.length !== 0) {
          nullProbes.forEach((probe) => {
            csv.write(
              `${deviceMacId}|${null}|${
                JSON.stringify(
                  JSON.stringify(probe),
                )
              }|${frameTimestamp}\n`,
            );
          });
        }
      });

      rl.on("close", async () => {
        console.log("DONE");
        rl.removeAllListeners();
        return resolve(true);
      });
    } catch (error) {
      return reject(false, error);
    }
  });
};

const start = async () => {
  try {
    const files = fs.readdirSync(filePath);
    if (!!!files) {
      console.log("Empty directory exiting");
      process.exit(1);
    } else {
      csv.write("deviceMacId|directedProbe|nullProbe|timestamp\n");
    }
    let readFilePromises = [];
    files.forEach(async (file) => {
      await readAndProcessFile(`${filePath}${file}`);
    });
  } catch (error) {
    console.log(error);
  }
};

//BEFORE STARTING CREATE A newData Directory
//Start
start();

//AFTER THIS RUNS COPY THE CSV FILE AND RUN THE COMMAND IN POSTGRES
// \copy "Wifis"("deviceMacId","directedProbe","nullProbe","timestamp") FROM '/root/postgres.csv' WITH DELIMITER '|' ESCAPE '\' CSV HEADER ;

//After the postgres migration is done, delete the newData directory
