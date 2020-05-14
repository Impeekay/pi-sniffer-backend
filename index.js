// Importing Node modules and initializing Express
const express = require("express");
const cors = require("cors");
const app = express();
const logger = require("morgan");
const bodyParser = require("body-parser");
const config = require("./config/main");

//set the environment from the config
process.env.NODE_ENV = config.environment;

const router = require("./api/routes");

//This is the DB connection which happens in models/index.js
const { sequelize } = require("./models");

const { io } = require("./singletons/socket");

const mqtt = require("./singletons/mqtt");

app.use(cors());

// Use CORS
app.options("*", cors());

//wait for DB sync then, start the server
sequelize.sync().then(() => {
  const server = app.listen(config.port);
  console.log("Your server is running on port " + config.port + ".");
});

// Setting up basic middleware for all Express requests
app.use(logger("dev")); // Log requests to API using morgan
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Enable CORS from client-side
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

io.on("connection", (socket) => {
  console.log("new connection " + socket.id);
});

//close the DB connection on end
process.on("SIGINT", () => {
  sequelize.close();
  console.log("Graceful shutdown");
  process.exit();
});

router(app);
