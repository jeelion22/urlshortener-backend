const express = require("express");
const urlShortnerController = require("../Controller/urlShortnerController");
const auth = require("../middleware/auth");
const urlShortnerRoutes = express.Router();

urlShortnerRoutes.post("/short", auth.hasToken, urlShortnerController.shortUrl);
urlShortnerRoutes.get("/:uuid", auth.hasToken, urlShortnerController.getUrl);
urlShortnerRoutes.delete(
  "/:uuid",
  auth.isAuth,
  urlShortnerController.removeUrl
);

module.exports = urlShortnerRoutes;
