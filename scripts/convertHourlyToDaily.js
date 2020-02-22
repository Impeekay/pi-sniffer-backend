const moment = require("moment");
const fs = require("fs");
let filePath = "../data/";

try {
  const files = fs.readdirSync(filePath);
  console.log(files);
  if (!!!files) {
    console.log("Empty directory exiting");
    process.exit(1);
  }
  files.forEach(file => {
    // console.log(moment(file).toDate());
    let newFileName = moment(file)
      .startOf("day")
      .toISOString();
    fs.open(`${filePath}${newFileName}`, "a", (err, fd) => {
      if (err) throw err;
      fs.readFile(`${filePath}${file}`, (err, data) => {
        if (err) throw err;
        fs.appendFile(fd, data.toString(), "utf8", err => {
          if (err) throw err;
          fs.unlink(`${filePath}${file}`, err => {
            if (err) throw err;
            console.log("Deleted old file");
          });
        });
      });
    });
  });
} catch (error) {
  console.log(error);
}
