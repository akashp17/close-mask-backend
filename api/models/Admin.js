const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);
adminSchema.pre("save", function (next) {
  let admin = this;
  if (!admin.isModified("password")) {
    return next();
  }

  bcrypt.hash(admin.password, 10, (err, hash) => {
    if (err) return err;
    admin.password = hash;
    next();
  });
});
module.exports = mongoose.model("Admin", adminSchema);
