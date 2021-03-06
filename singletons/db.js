const Sequelize = require("sequelize");

const sequelizeClient = new Sequelize("pi", "node", "password", {
  host: "localhost",
  dialect: "postgres",
  pool: {
    max: 5,
    idle: 30000,
    acquire: 60000,
  },
});

sequelizeClient
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully");
  })
  .catch((err) => {
    console.log("Unable to connect: ", err);
  });

module.exports = { sequelizeClient };
// "use strict";
// const config = require("../configs/config");
// const mongoose = require("mongoose");
// mongoose.Promise = global.Promise;

// const db = mongoose.createConnection(config.database, {
//   poolSize: 10,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false
// });

// // CONNECTION EVENTS
// // When successfully connected
// mongoose.connection.on("connected", function() {
//   console.log("Mongoose default connection open");
// });

// // If the connection throws an error
// mongoose.connection.on("error", function(err) {
//   console.log("Mongoose default connection error: " + err);
// });

// // When the connection is disconnected
// mongoose.connection.on("disconnected", function() {
//   console.log("Mongoose default connection disconnected");
// });

// // If the Node process ends, close the Mongoose connection
// process.on("SIGINT", function() {
//   mongoose.connection.close(function() {
//     console.log(
//       "Mongoose default connection disconnected through app termination"
//     );
//     process.exit(0);
//   });
// });

// module.exports = db;
