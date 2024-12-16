const express = require("express");
const urlShortnerController = require("../Controller/urlShortnerController");

const urlShortnerRoutes = express.Router();

urlShortnerRoutes.post("/short", urlShortnerController.shortUrl);
urlShortnerRoutes.get("/:uuid", urlShortnerController.getUrl);

module.exports = urlShortnerRoutes;
