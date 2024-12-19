const mongoose = require("mongoose");
const validator = require("validator");
const URLShortner = require("./url");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "First name is required"],
    minLength: [3, "First name should be at least 3 characters"],
    maxLength: [12, "First name should not exceed 12 characters"],
  },
  lastname: {
    type: String,
    maxLength: [14, "Last name should not exceed 14 characters"],
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: (props) => `${props.value} is not a valid email address`,
    },
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"],
  },

  urlsShortened: {
    type: [
      {
        urlObjectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: URLShortner,
          required: [true, "urlId is required"],
        },

        shortenedUrlId: {
          type: String,
          required: [true, "Shortened Id is required"],
        },
      },
    ],
    default: [],
  },

  isEmailVerified: {
    type: Boolean,
    reuired: [true, "Email verification status is required"],
    default: false,
  },

  emailVerificationToken: { type: String },
  emailVerificationTokenExpiresAt: { type: Date },
});

// creates email verification link
userSchema.methods.sendEmailVerificationLink = async function () {
  try {
    const emailToken = crypto.randomBytes(32).toString("hex");
    this.emailVerificationToken = crypto
      .createHash("sha256")
      .update(emailToken)
      .digest("hex");
    this.emailVerificationTokenExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await this.save();

    const option = {
      email: this.email,
      subject: "Verify your Email for URLShortener Account",
      message: `<div style=""><p>Hi ${this.firstname} ${
        this.lastname ? this.lastname : ""
      }, </p>
    <p>Please verify your email address by the <a href=http://localhost:3000/api/user/account/verify/${
      this._id
    }/${emailToken} target="_blank">link</a></p>
    <p>If it was not initiated by you, then no action is required. Please ignore this mail.</p>

    <p>
    With regards <br> URLShortener Team
    </p>
    </div>`,
    };

    await sendEmail(option);
  } catch (error) {
    console.log(error.message);
  }
};

userSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const userExists = await mongoose.models.User.findOne({
        email: this.email,
      });

      if (userExists) {
        const err = new Error("User already exists");
        err.status = 400;
        return next(err);
      }

      next();
    } catch (error) {
      next(error);
    }
  } else next();
});

module.exports = mongoose.model("User", userSchema, "users");
