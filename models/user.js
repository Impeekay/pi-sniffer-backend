"use strict";
const db = require("../singletons/db");
const Schema = require("mongoose").Schema;
const bcrypt = require("bcryptjs");

// User Schema
const UserSchema = new Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    profile: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true }
    },
    invitationToken: {
      type: String,
      unique: true,
      sparse: true
    },
    invitationCreatedAt: {
      type: Date
    },
    invitationSentAt: {
      type: Date
    },
    invitationAcceptedAt: {
      type: Date
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    verified: {
      type: Boolean,
      default: false
    },
    invited: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  {
    timestamps: true
  }
);

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre("save", function(next) {
  console.log("ASONCSLK");
  const user = this,
    SALT_FACTOR = 5;

  if (!user.isModified("password")) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  console.log(this.password);
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

module.exports = db.model("User", UserSchema);
