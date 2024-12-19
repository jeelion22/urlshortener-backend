const express = require("express");
const userController = require("../Controller/userController");
const auth = require("../middleware/auth");

const userRoutes = express.Router();

userRoutes.post("/register", userController.register);
userRoutes.post("/login", userController.login);
userRoutes.get(
  "/account/verify/:userId/:emailToken",
  userController.verifyAccount
);
userRoutes.post("/forgotPassword", userController.forgotPassword);
userRoutes.patch(
  "/account/password/reset/:userId/:passwordResetToken",
  userController.resetPassword
);
userRoutes.get("/me", auth.isAuth, userController.me);
userRoutes.get("/logout", auth.isAuth, userController.logout);

module.exports = userRoutes;
