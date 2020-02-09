const config = require("../../configs/config");
const mongoose = require("mongoose");
const User = require("../../models/user");

const db = require("../../singletons/db");

db.once("open", async () => {
  await dropDataBase();
  insertUser();
});

const dropDataBase = async () => {
  await db.dropDatabase();
};

const insertUser = () => {
  const email = "me@peekay.in";
  const firstName = "Pavan";
  const lastName = "Kumar";
  const invited = true;
  const verified = true;
  let admin;
  let password = "abcd1234";

  admin = new User({
    password: password,
    email: email,
    profile: {
      firstName: firstName,
      lastName: lastName
    },
    invited: invited,
    verified: verified
  });

  admin.save((err, user) => {
    if (err) {
      console.log("an error occured");
    } else {
      console.log(user);
      process.exit(0);
    }
  });
};
