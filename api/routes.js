const express = require("express");
const { getLatestFileContent } = require("../controllers/piData");

module.exports = app => {
  const apiRoutes = express.Router();
  const piDataRoutes = express.Router();

  app.use("/api", apiRoutes);

  apiRoutes.use("/piData", piDataRoutes);

  piDataRoutes.get("/", getLatestFileContent);
};
