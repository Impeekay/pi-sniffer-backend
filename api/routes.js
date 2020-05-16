const express = require("express");
const {
  getLatestFileContent,
  getLatestProbesFromDb,
  // getCameraDetections,
} = require("../controllers/piData");

module.exports = (app) => {
  const apiRoutes = express.Router();
  const piDataRoutes = express.Router();

  app.use("/api", apiRoutes);

  apiRoutes.use("/piData", piDataRoutes);

  piDataRoutes.get("/", getLatestProbesFromDb);

  // piDataRoutes.get("/camera", getCameraDetections);
};
