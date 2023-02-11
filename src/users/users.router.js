const express = require("express");
const usersController = require("./users.controllers.js");
const { imageParser, upload } = require("../imageParser/imageParser");
const router = express.Router();

router.post(
  "/register",
  usersController.userDataValidation,
  usersController.userRegistration
);

router.get("/verify/:verificationToken", usersController.verifyEmail);

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

router.post(
  "/verify",
  usersController.validateRepeatVerify,
  usersController.repeatVerify
);

router.patch(
  "/",
  usersController.authorize,
  usersController.updateUserSubscription
);

router.patch(
  "/avatars",
  usersController.authorize,
  upload.single("file_example"),
  imageParser,
  usersController.updateUserAvatar
);

module.exports = router;
