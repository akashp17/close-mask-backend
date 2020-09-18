var jwt = require('jsonwebtoken');
const { secret } = require("../../config/main");

module.exports = {
  checkAuthenticated: (req, res, next) => {
    try {
      if (!req.cookies.token)
        return res.status(401).send({ done: false, message: "Not authenticated" });
      req.admin = jwt.verify(req.cookies.token, secret);
      next();
    }
    catch (err) {
      res.status(401).send({ done: false, message: "Not authenticated" });
    }
  }
};
