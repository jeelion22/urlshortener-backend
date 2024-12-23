const URLShortner = require("../models/url");
const User = require("../models/user");

const urlShortnerController = {
  shortUrl: async (req, res) => {
    try {
      const userId = req.userId;
      const url = req.body;

      const shortUrl = new URLShortner(url);

      await shortUrl.save();

      if (userId) {
        const user = await User.findByIdAndUpdate(userId);

        user?.urlsShortened.push({
          urlObjectId: shortUrl._id,
          shortenedUrlId: shortUrl.shortenedUrl,
        });
        await user?.save();
      }

      res.status(201).json({
        message: "Url shortened successfully",
        shortenedUrl: `http://localhost:3000/api/url/${shortUrl.shortenedUrl}`,
      });
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

  removeUrl: async (req, res) => {
    try {
      const userId = req.userId;
      const uuid = req.params.uuid;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const docToDelete = user.urlsShortened.find(
        (item) => item.shortenedUrlId === uuid
      );

      if (!docToDelete) {
        return res.status(404).json({ message: "URL not found" });
      }

      user.urlsShortened = user.urlsShortened.filter(
        (urlShortened) => urlShortened.shortenedUrlId !== uuid
      );

      if (docToDelete) {
        await URLShortner.findOneAndDelete({
          _id: docToDelete.urlObjectId,
          shortenedUrl: uuid,
        });
      }

      await user.save();

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = urlShortnerController;
