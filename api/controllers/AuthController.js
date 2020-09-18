const jwt = require("jsonwebtoken");
const { secret, jwtExpTime } = require("../../config/main");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

// new Admin({ username: "admin", password: "test#2198" }).save();

module.exports = {
  logout: async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout", done: true });
  },

  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const admin = await Admin.findOne({ username });

      if (!admin)
        return res.status(200).json({ done: false, message: "No such account found" });

      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        const token = jwt.sign({ _id: admin._id }, secret, {
          expiresIn: jwtExpTime,
        });

        res.cookie("token", token)
          .status(200)
          .json({ done: true, message: "Logged In" });
      } else {
        res
          .status(200)
          .json({ done: false, message: "Incorrect Email or Password!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
