const express = require('express');

module.exports = (app) => {
  const apiRoutes = express.Router();

  app.use('/api',apiRoutes);
}