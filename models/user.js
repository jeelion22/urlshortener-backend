const mongoose = require("mongoose");
const validator = require("validator");
const URLShortner = require("./url");
const crypto = require("crypto");
const sendEmail = require("../utils/email");
const generateToken = require("../utils/token");

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

  isPasswordResetRequested: {
    type: Boolean,
    default: false,
  },

  passwordResetVerificationToken: {
    type: String,
  },
  passwordResetVerificationTokenExpiresAt: {
    type: Date,
  },
});

// creates email verification link
userSchema.methods.sendEmailVerificationLink = async function () {
  try {
    const { randomKey, hashedRandomKey } = generateToken();
    this.emailVerificationToken = hashedRandomKey;
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
    }/${randomKey} target="_blank">link</a></p>
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

// password reset request
userSchema.methods.sendPasswordResetLink = async function () {
  const { randomKey, hashedRandomKey } = generateToken();

  try {
    this.passwordResetVerificationToken = hashedRandomKey;
    this.passwordResetVerificationTokenExpiresAt = new Date(
      Date.now() + 15 * 3600 * 1000
    );
    this.isPasswordResetRequested = true;

    await this.save();

    const option = {
      email: this.email,
      subject: "Password Reset Link for URLShortener Account",
      message: `<div style=""><p>Hi ${this.firstname} ${
        this.lastname ? this.lastname : ""
      }, </p>
    <p>Please click the <a href=http://localhost:3000/api/user/account/password/reset/${
      this._id
    }/${randomKey} target="_blank">link</a> for reset password for your URLShortener account. <em>It is valid only for 15 minutes</em>
    </p>
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
