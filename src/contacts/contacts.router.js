const express = require("express");
const contactController = require("./contacts.controllers");
const userController = require("../users/users.controllers");

const router = express.Router();

router.get("/", userController.authorize, contactController.getAllContacts);

router.get(
  "/:contactId",
  userController.authorize,
  contactController.validateUserID,
  contactController.getContact
);

router.post(
  "/",
  userController.authorize,
  contactController.validateAddContact,
  contactController.addNewContact
);

router.delete(
  "/:contactId",
  userController.authorize,
  contactController.validateUserID,
  contactController.removeContactById
);

router.put(
  "/:contactId",
  userController.authorize,
  contactController.validateUpdateContactById,
  contactController.updateContactById
);

router.patch(
  "/:contactId/favorite",
  userController.authorize,
  contactController.validateUserID,
  contactController.updateStatusContact
);

module.exports = router;
