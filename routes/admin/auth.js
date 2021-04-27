const express = require("express");
// destructor off single 'check' function that we plan on using
const { check, validationResult } = require("express-validator");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPassowrdForUser,
} = require("./validators");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [
    // this will all flow into req object
    requireEmail,
    requirePassword,
    requirePasswordConfirmation,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      return res.send(signupTemplate({ req, errors }));
    }
    // get access to form data
    const { email, password, passwordConfirmation } = req.body;

    // create a user in our user repo to represent this person
    const user = await usersRepo.create({ email: email, password: password });
    // Store the id that user inside the users cookie
    // .session property is added by cookie-session middleware
    req.session.userID = user.id;
    res.send("Account Created");
  }
);

router.get("/signout", (req, res) => {
  req.session = null;
  res.send("you are logged out");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate());
});

router.post(
  "/signin",
  [requireEmailExists, requireValidPassowrdForUser],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    const { email } = req.body;

    const user = await usersRepo.getOneBy({ email: email });

    req.session.userID = user.id;

    res.send("You are signed in!");
  }
);

module.exports = router;
