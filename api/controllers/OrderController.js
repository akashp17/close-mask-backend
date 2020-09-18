const crypto = require('crypto');
const uniqid = require('uniqid');

const Order = require('../models/Order');
const RefundRequest = require('../models/RefundRequest');

const config = require('../../config/main');

const { sendEmail } = require('../../utils/mailer');
const { sendSms } = require('../../utils/sms');
const axios = require('axios');

const { SHOPIFY_APP_KEY, SHOPIFY_PASSWORD, SHOPIFY_SHOP_NAME } = process.env;
const apiUrl = `https://${SHOPIFY_APP_KEY}:${SHOPIFY_PASSWORD}@${SHOPIFY_SHOP_NAME}`;

module.exports.newOrder = async (req, res) => {
  try {
    var {
      name,
      phone,
      email,
      address,
      price,
      coupon,
      shippingCharge,
      shippingName,
      couponDiscountAmount,
      close_signature,
      products,
      transactionId,
      addressJson,
    } = req.body;
    // console.log(req.body);
    // console.log("inc", req.body);
    if (
      !name ||
      !phone ||
      !email ||
      !address ||
      !price ||
      !shippingCharge ||
      !couponDiscountAmount ||
      !close_signature ||
      !transactionId ||
      !addressJson
    )
      return res
        .status(400)
        .send({ done: false, message: 'Parameters are missing' });

    const calculatedHash = crypto
      .createHmac('sha256', config.close_secert)
      .update(
        `${transactionId}|${price}|${shippingCharge}|${couponDiscountAmount}`
      )
      .digest('hex');

    if (calculatedHash !== close_signature)
      return res
        .status(400)
        .send({ done: false, message: 'Signature does not match' });

    products = JSON.parse(products);
    addressJson = JSON.parse(addressJson);
    price = parseInt(price);
    shippingCharge = parseInt(shippingCharge);
    couponDiscountAmount = parseInt(couponDiscountAmount);

    // var calculatedPrice = 0;
    // for (var i = 0; i < products.length; i++) { /
    // 	calculatedPrice +=
    // 		parseInt(products[i].variants[0].price) *
    // 		parseInt(products[i].quantity);
    // }

    // if (price != calculatedPrice)
    // 	return res
    // 		.status(400)
    // 		.send({ done: false, message: "Prices don't match" });

    var order = await Order.findOne({ closeTransactionId: transactionId });
    if (order)
      return res.status(400).send({
        done: false,
        message: 'Order already exist for this Close transaction',
      });

    let result = await axios.post(`${apiUrl}/admin/api/2020-07/orders.json`, {
      order: {
        line_items: products.map((p) => ({
          variant_id: p.id,
          quantity: p.quantity,
        })),
        email: email,
        send_receipt: true,
        send_fulfillment_receipt: true,
        customer: {
          first_name: addressJson.deliveryName.split(' ')[0],
          last_name: addressJson.deliveryName.split(' ')[1] || '-',
          email: email,
        },
        shipping_address: {
          first_name: addressJson.deliveryName.split(' ')[0],
          last_name: addressJson.deliveryName.split(' ')[1] || '-',
          address1: addressJson.street,
          phone: addressJson.deliveryPhone,
          city: addressJson.city,
          province: addressJson.state,
          country: addressJson.country,
          zip: addressJson.pincode,
        },
      },
    });
    products = products.map((p) => ({
      ...p,
      price: 0,
      id: p.id,
      name: 'Shopify Product',
    }));
    order = await new Order({
      name,
      email,
      phone,
      address,
      shippingName,
      shippingCharge,
      coupon,
      couponDiscountAmount,
      price,
      closeTransactionId: transactionId,
      shopifyOrderId: result.data.order.id,
      products,
      delivered: false,
      orderId: uniqid(),
    }).save();

    res.status(200).json({ done: true, message: 'Order created' });

    // try {
    //   sendEmail(
    //     order.email,
    //     'Order Placed',
    //     `Hey ${
    //     order.name
    //     }, your order has been placed successfully, order id: ${
    //     order.orderId
    //     } <br />
    //     Order details: <br /> ${order.products
    //       .map((p) => `${p.name} X ${p.quantity}`)
    //       .join('<br />')}`
    //   );
    //   if (process.env.SEND_SMS)
    //     sendSms(
    //       [order.phone],
    //       `Your order has been successfully placed at Mask By Close, order id: ${order.orderId}`
    //     );
    // } catch (err) {
    //   console.log(err);
    // }
  } catch (err) {
    if (err.response && err.response.data) console.log(err.response.data);
    else console.log(err);
    res.status(500).send({ done: false, message: err.message });
  }
};

module.exports.generateCloseTransId = async (req, res) => {
  try {
    if (!req.body.products)
      return res.status(400).send({ done: false, message: 'product field missing' });
    var prods = [];
    var shippingOptions = [];
    var price = 0;
    for (var p of req.body.products) {
      // console.log(p);

      const pinfo = await axios.get(
        `${apiUrl}/admin/api/2020-07/products/${p.id}.json`
      );
      // console.log(pinfo.data);
      price += parseInt(pinfo.data.product.variants[0].price) * parseInt(p.quantity);
      prods.push({
        productName: pinfo.data.product.title,
        productId: pinfo.data.product.variants[0].id,
        productPrice: parseInt(pinfo.data.product.variants[0].price),
        productImage: pinfo.data.product.image.src,
        productQuantity: parseInt(p.quantity),
      });
    }
    if (price < 500) {
      shippingOptions.unshift({
        name: 'Shipping Charge',
        price: 75,
      });
    }
    // console.log(price);

    const close = await axios.post(`${process.env.CLOSE_API}/transaction`, {
      apiKey: process.env.CLOSE_KEY,
      placeOrderUrl: process.env.PLACE_ORDER_URL,
      price: price,
      tax: 0,
      products: prods,
      shippingOptions: shippingOptions,
      secret: process.env.CLOSE_SECRET
    });
    if (close.data.done)
      return res.send({ done: true, message: "trans id generated", transactionId: close.data.transactionId });
    res.send({ done: false, message: "Failed to generate transaction id, check server logs" });
    console.log(close.data);
  }
  catch (err) {
    console.log(err.response && err.response.data ? err.response.data : err);
    res.status(500).send({ done: false, message: err.message });
  }
};

module.exports.getOrders = async (req, res) => {
  try {
    var page = req.query.page ? req.query.page : 1;
    var limit = req.query.limit ? req.query.limit : 10;
    var sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    var sortDirec = req.query.sortDirec ? req.query.sortDirec : -1;
    var result = await Order.paginate(
      {},
      {
        page: page,
        limit: limit,
        sort: { [sortBy]: sortDirec },
        // populate: {
        //     path: 'userId',
        //     model: User,
        //     select: 'email'
        // }
      }
    );
    res.json({
      done: true,
      message: 'Orders found',
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ done: false, message: err.message });
  }
};

// module.exports.markDelivered = async (req, res) => {
//   try {
//     if (!req.body.orderId)
//       return res.status(401).json({
//         done: false,
//         message: 'No order Id',
//       });

//     const order = await Order.findOneAndUpdate(
//       { _id: req.body.orderId },
//       {
//         delivered: true,
//       }
//     );
//     res.json({
//       done: true,
//       message: 'Marked delivered',
//     });
//     try {
//       sendEmail(
//         order.email,
//         'Order delivered',
//         `Hey ${
//         order.name
//         }, we are sending you this email to inform you that your order has been delivered. <br /> 
//         Order details: <br /> ${order.products
//           .map((p) => `${p.name} X ${p.quantity}`)
//           .join('<br />')}`
//       );
//       if (process.env.SEND_SMS)
//         sendSms(
//           [order.phone],
//           `Your order at Mask - By Close has been delivered successfully, order id: ${order.orderId}, check your registered email for order details`
//         );
//     } catch (err) {
//       console.log(err);
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ done: false, message: err.message });
//   }
// };

module.exports.orderCancelHook = async (req, res) => {
  try {
    if (!req.body.id)
      return res.send({ done: false, message: 'Invalid request' });
    const order = await Order.findOne({ shopifyOrderId: req.body.id + '' });
    if (!order) {
      console.log('Hook called for invalid order id');
      return res.send({ done: false, message: 'Invalid order Id' });
    }
    var refundRequest = await new RefundRequest({
      closeTransactionId: order.closeTransactionId,
      shopifyOrderId: order.shopifyOrderId,
      orderId: order.orderId,
      done: false,
      response: '-',
    }).save();
    console.log('PROCESSING REFUND - WEB HOOK');
    const hash = crypto
      .createHmac('sha256', process.env.CLOSE_SECRET)
      .update(order.closeTransactionId)
      .digest('hex');
    let result = await axios.post(
      `${process.env.CLOSE_API}/transaction-refund`,
      {
        transactionId: order.closeTransactionId,
        apiKey: process.env.CLOSE_KEY,
        hash,
      }
    );
    refundRequest.done = result.data.done;
    refundRequest.response = result.data.message;
    await refundRequest.save();
    res.send({ done: true });
  } catch (err) {
    console.log(err.response && err.response.data ? err.response.data : err);
    res.status(500).send({ done: false, message: err.message });
  }
};
