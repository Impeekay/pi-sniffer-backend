const moment = require("moment");
const fs = require("fs");
let filePath = "../data/";
let tmpPath = "../newData/";

try {
  const files = fs.readdirSync(filePath);
  // console.log(files);
  if (!!!files) {
    console.log("Empty directory exiting");
    process.exit(1);
  } else {
    fs.mkdirSync(tmpPath);
  }
  files.forEach((file) => {
    // console.log(moment(file).toDate());
    let newFileName = moment(file).startOf("day").toISOString();
    const fd = fs.openSync(`${tmpPath}${newFileName}`, "a");
    let data = fs.readFileSync(`${filePath}${file}`);
    console.log(`appending ${file} to ${newFileName}`);
    fs.appendFileSync(fd, data.toString(), "utf8");
    fs.closeSync(fd);
  });
  fs.rmdirSync(filePath, { recursive: true }); //remove the old directory
  fs.renameSync(tmpPath, filePath);
} catch (error) {
  console.log(error);
}
