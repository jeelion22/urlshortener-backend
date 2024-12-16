const express = require("express");
const mongoose = require("mongoose");
const app = require("./app");

async function connectServer() {
  try {
    console.log("Connecting to MongDB...");

    await mongoose.connect("mongodb://localhost:27017/urlshortner");

    console.log("Connected to MongoDB");

    app.listen(3000, () => {
      console.log("Server is running on PORT 3000");
    });

    process.on("SIGINT", async () => {
      console.log("Closing MongoDB connection...");
      mongoose.disconnect();
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error.message);
    process.exit(1);
  }
}

connectServer();
