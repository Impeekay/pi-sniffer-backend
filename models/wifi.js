"use strict";
module.exports = (sequelize, DataTypes) => {
  const Wifi = sequelize.define(
    "Wifi",
    {
      deviceMacId: DataTypes.STRING,
      directedProbe: DataTypes.JSONB,
      nullProbe: DataTypes.JSONB,
      timestamp: DataTypes.DATE,
    },
    {}
  );
  Wifi.associate = function (models) {
    // associations can be defined here
  };
  return Wifi;
};
