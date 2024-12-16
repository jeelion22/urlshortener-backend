const URLShortner = require("../models/url");

const urlShortnerController = {
  shortUrl: async (req, res) => {
    try {
      const url = req.body;

      const shortUrl = new URLShortner(url);

      await shortUrl.save();

      res.status(201).json({ message: "Url shortened successfully" });
    } catch (error) {
      if (error.status === 400) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  getUrl: async (req, res) => {
    try {
      const uuid = req.params.uuid;

      const shortedUrl = await URLShortner.findOne({ shortenedUrl: uuid });

      if (!shortedUrl) {
        return res.status(404).json({ message: "Url not found" });
      }

      shortedUrl.clicks++;

      await shortedUrl.save();

      res.redirect(shortedUrl.url);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = urlShortnerController;
