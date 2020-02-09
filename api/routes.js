const express = require("express");
const { getLatestFileContent } = require("../controllers/piData");
const passportService = require("../configs/passport");
const passport = require("passport");

const AuthenticationController = require("../controllers/authentication");
const UserController = require("../controllers/user");

// Middleware to require login/auth
const requireAuth = passport.authenticate("jwt", {
  session: false,
  failWithError: true
});
const requireLogin = passport.authenticate("local", {
  session: false,
  failWithError: true
});

const authError = function(err, req, res, next) {
  res.json({ error: err.message });
};

module.exports = app => {
  const apiRoutes = express.Router();
  const authRoutes = express.Router();
  const piDataRoutes = express.Router();
  const userRoutes = express.Router();

  app.use("/api", apiRoutes);

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use("/auth", authRoutes);

  // Registration route
  authRoutes.post("/register", AuthenticationController.register);

  // Login route
  authRoutes.post(
    "/login",
    requireLogin,
    AuthenticationController.login,
    authError
  );

  apiRoutes.use("/piData", piDataRoutes);

  piDataRoutes.get("/", requireAuth, getLatestFileContent, authError);

  // Set User routes as subgroup/middleware to apiRoutes
  apiRoutes.use("/users", userRoutes);

  // User Find All
  userRoutes.get("/", requireAuth, UserController.fetchAll, authError);

  // User Find One
  userRoutes.get("/:id", requireAuth, UserController.fetchOne, authError);

  // User update
  userRoutes.put("/:id", requireAuth, UserController.update, authError);

  // User set password
  userRoutes.post("/set-password", UserController.setPassword);

  // User reset password
  userRoutes.post("/reset-password", UserController.resetPassword);

  // User forgot password
  userRoutes.post("/forgot-password", UserController.forgotPassword);

  // User change password
  userRoutes.post(
    "/change-password/:id",
    requireAuth,
    UserController.changePassword,
    authError
  );
};
