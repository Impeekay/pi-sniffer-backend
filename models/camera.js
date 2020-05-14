"use strict";
module.exports = (sequelize, DataTypes) => {
  const Camera = sequelize.define(
    "Camera",
    {
      deviceMacId: DataTypes.STRING,
      detections: DataTypes.INTEGER,
      timestamp: DataTypes.DATE,
    },
    {}
  );
  Camera.associate = function (models) {
    // associations can be defined here
  };
  return Camera;
};
