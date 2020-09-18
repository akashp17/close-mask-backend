const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: parseInt(process.env.PORT),
  dbUrl: process.env.MONGO_URI,
  secret: process.env.SECRET,
  jwtExpTime: process.env.JWT_EXP_TIME,
  close_secert: process.env.CLOSE_SECRET
};
