const express = require("express");
const usersController = require("./users.controllers.js");

const router = express.Router();

router.post(
  "/register",
  usersController.userDataValidation,
  usersController.userRegistration
);

router.put(
  "/login",
  usersController.userDataValidation,
  usersController.userLogIn
);

router.put("/logout", usersController.authorize, usersController.userLogout);

router.get(
  "/current",
  usersController.authorize,
  usersController.getCurrentUser
);

router.patch(
  "/",
  usersController.authorize,
  usersController.updateUserSubscription
);

module.exports = router;
