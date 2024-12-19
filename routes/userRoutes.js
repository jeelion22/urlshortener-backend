const express = require("express");
const userController = require("../Controller/userController");

const userRoutes = express.Router();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.get(
  "/account/verify/:userId/:emailToken",
  userController.verifyAccount
);

module.exports = userRoutes;
