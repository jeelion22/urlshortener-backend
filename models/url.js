const mongoose = require("mongoose");
const ShortUniqueId = require("short-unique-id");
const validator = require("validator");

const uid = new ShortUniqueId({ length: 10 });

const urlShortnerSchema = mongoose.Schema({
  url: {
    type: String,
    validate: {
      validator: (val) => validator.isURL(val, { require_protocol: true }),
      message: (props) => {
        return `${props.value} is not a valid URL`;
      },
    },
    required: [true, "URL to be shortened is required"],
  },

  shortenedUrl: {
    type: String,
    required: [true, "Shortened UUID is required"],
    unique: true,
    default: () => uid.rnd(),
  },

  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
});

urlShortnerSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const existingShortenedUrl = await mongoose.models.URLShortner.findOne({
        shortenedUrl: this.shortenedUrl,
      });

      if (existingShortenedUrl) {
        const err = new Error("Unique ID already exists");
        err.status = 400;
        return next(err);
      }

      next();
    } catch (error) {
      next(error);
    }
  } else next();
});

module.exports = mongoose.model(
  "URLShortner",
  urlShortnerSchema,
  "urlshortners"
);
