const mongoose = require("mongoose");


const refundRequestSchema = new mongoose.Schema({
  closeTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  shopifyOrderId: {
    type: String,
    required: true
  },
  done: {
    type: Boolean,
    required: true,
    default: false
  },
  response: { type: String }
},
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Refund_request", refundRequestSchema);
