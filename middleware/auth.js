const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const auth = {
  isAuth: async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    try {
      const decodedToken = jwt.verify(token, JWT_SECRET);

      req.userId = decodedToken.id;

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({ message: "Invaild token" });
      } else if (error.response) {
        res
          .status(error.response.status)
          .json({ message: error.response.data });
      } else {
        res.status(500).json({ message: "An unexpected error occured" });
      }
    }
  },

  hasToken: async (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
      try {
        const decodedToken = jwt.verify(token, JWT_SECRET);

        req.userId = decodedToken.id;
      } catch (error) {
        return res.status(401).json({ message: error.message });
      }
    }

    next();
  },
};

module.exports = auth;
