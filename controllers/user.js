"use strict";
const User = require("../models/user"),
  randomstring = require("randomstring"),
  client = require("../configs/config"),
  mailer = require("./utils/mailer"),
  bcrypt = require("bcryptjs");

// Fetch all
const fetchAll = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }); //exclude passwords from the fetched documents
    res.status(200).json({ users });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Fetch one
const fetchOne = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Update
const update = async (req, res, next) => {
  try {
    // Check for user validation errors
    const query = { _id: req.params.id };
    let update = req.body;
    const user = await User.findOneAndUpdate(query, update, {
      upsert: true,
      new: true
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Set password
const setPassword = async (req, res, next) => {
  try {
    const invitationToken = req.body.invitationToken;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!invitationToken) {
      return res.status(404).json({ error: "Invitation Token Not Present" });
    }

    if (password !== confirmPassword) {
      return res.status(404).json({ error: "Passwords Do Not Match" });
    }

    let user = await User.findOne({ invitationToken: invitationToken });

    if (!user) {
      return res.status(500).json({ error: "Invalid Invitation Token" });
    }

    if (user.verified) {
      return res.status(500).json({ error: "User is already verified" });
    }

    if (user.invitationToken !== invitationToken) {
      return res.status(404).json({ error: "Invalid Invitation Token" });
    }

    user.password = password;
    user.verified = true;

    user = await user.save();

    user.invitationToken = null;
    user.save();
    res
      .status(200)
      .json({ message: "Your password has been set successfully" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = req.body.resetPasswordToken;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!resetPasswordToken) {
      return res
        .status(404)
        .json({ error: "Reset Password Token Not Present" });
    }

    if (password !== confirmPassword) {
      return res.status(404).json({ error: "Passwords Do Not Match" });
    }

    let user = await User.findOne({ resetPasswordToken });

    if (!user) {
      return res.status(500).json({ error: "Invalid Reset Password Token" });
    }

    if (user.resetPasswordToken !== resetPasswordToken) {
      return res.status(404).json({ error: "Invalid Reset Password Token" });
    }

    user.password = password;
    user = await user.save();

    user.resetPasswordToken = null;
    user.save();

    res
      .status(200)
      .json({ message: "Your password has been reset successfully" });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
// Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;

    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    // Send Invitation Email
    const key = randomstring.generate();
    const forgotURL = `${client.clientUrl}/invitations/resetpassword?token=${key}`;
    const mail = {
      toEmail: user.email,
      subject: "Forgot Password instructions",
      content: `Hello ${user.email},\n\nSomeone has requested a link to change your password linked to Syook Track & Trace for piDev application.\n\nYou can do this through the link below. \n\n${forgotURL}. \n\nIf you didn't request this, please ignore this email.\n\nYour password won't change until you access the link above and create a new one.`
    };

    user.resetPasswordToken = key;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    user = await user.save();

    const resp = await mailer.sendInvitation(mail).catch(error => {
      // console.log('Error From Mailer', error);

      res.status(500).json({ error: error.message });
    });

    res.status(200).json({
      message:
        "You will receive an email with instructions on how to reset your password in a few minutes."
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
// Change password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!userId) {
      return res
        .status(404)
        .json({ error: "User is needed to proceed with this action" });
    }

    if (password !== confirmPassword) {
      return res.status(404).json({ error: "Password Do Not Match" });
    }

    let user = await User.findOne({ _id: userId }).populate("role");

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return res.status(301).json({
        error: "Password is the same. Please choose another password and retry"
      });
    }
    user.password = password;
    user = await user.save();

    res.status(200).json({ message: "Password Succesfully Changed" });
  } catch (error) {
    res.status(404).json({
      error: error.message
    });
  }
};
module.exports = {
  fetchAll,
  fetchOne,
  update,
  setPassword,
  resetPassword,
  forgotPassword,
  changePassword
};
