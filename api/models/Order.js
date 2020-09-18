const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const orderSchema = new mongoose.Schema({
  closeTransactionId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  coupon: {
    type: String,
    default: ""
  },
  couponDiscountAmount: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCharge: {
    type: Number,
    required: true,
    default: 0
  },
  products: [Object],
  shippingName: {
    type: String,
    default: ""
  },
  delivered: {
    type: Boolean,
    required: true,
    default: false
  },
  orderId: {
    type: String,
    required: true
  },
  shopifyOrderId: {
    type: String,
    required: true
  }
},
  {
    timestamps: true
  }
);

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", orderSchema);
