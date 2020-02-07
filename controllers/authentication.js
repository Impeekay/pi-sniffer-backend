"use strict";

const jwt = require("jsonwebtoken"),
  User = require("../models/user"),
  config = require("../configs/config"),
  randomstring = require("randomstring"),
  mailer = require("./utils/mailer");

function generateToken(user) {
  return jwt.sign(user, config.secret, {
    expiresIn: 86400 // in seconds
  });
}

// Set user info from request
function setUserInfo(request) {
  return {
    _id: request._id,
    firstName: request.profile.firstName,
    lastName: request.profile.lastName,
    email: request.email,
    invitationToken: request.invitationToken,
    verified: request.verified,
    invitedBy: request.invitedBy
  };
}

// Login Route
exports.login = function(req, res, next) {
  let userInfo = setUserInfo(req.user);
  let token = generateToken(userInfo);
  res.status(200).json({ token: "JWT " + token, user: userInfo });
};

// Registration Route
exports.register = async function(req, res, next) {
  try {
    // Check for registration errors
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    // Return error if no email provided
    if (!email) {
      return res.status(422).json({ error: "You must enter an email address" });
    }

    // Return error if full name not provided
    if (!firstName || !lastName) {
      return res.status(422).json({ error: "You must enter your full name" });
    }

    // Return error if no password provided
    if (!password) {
      return res.status(422).json({ error: "You must enter a password" });
    }

    const existingUser = await User.findOne({ email });

    // console.log("existingUser", existingUser);

    // If user is not unique, return error
    if (existingUser) {
      return res
        .status(422)
        .json({ error: "That email address is already in use" });
    }

    // If email is unique and password was provided, create account
    let user = new User({
      email: email,
      password: password,
      profile: { firstName, lastName }
    });

    user = await user.save();

    // Send Invitation Email
    const key = randomstring.generate();
    const inviteURL = `${config.clientUrl}/invitations/setpassword?token=${key}`;
    const mail = {
      toEmail: user.email,
      subject: "Invitation instructions",
      content: `Hello ${user.email}.\n\nSomeone has invited you to join Syook Track & Trace for piDev.\n\nYou can accept it through the link below. \n\n${inviteURL}. \n\nIf you don't want to accept the invitation, please ignore this email.\n\nYour account won't be created until you access the link above and set your password.`
    };

    const resp = await mailer.sendInvitation(mail).catch(error => {
      // console.log('Error From Mailer', error);
      let userInfo = setUserInfo(user);

      res.status(201).json(
        response.success({
          token: "JWT " + generateToken(userInfo),
          user: user
        })
      );
    });

    user.invitationCreatedAt = Date.now();
    user.invitationSentAt = Date.now();
    user.invitationToken = key;
    user.invited = true;
    const usr = await user.save();

    let userInfo = await setUserInfo(usr);

    res.status(201).json({
      token: "JWT " + generateToken(userInfo),
      user: usr
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
