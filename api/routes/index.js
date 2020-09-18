const express = require('express');
const router = express.Router();

const AuthMiddleware = require('../middlewares/auth');

const AuthController = require('../controllers/AuthController');
const OrderController = require('../controllers/OrderController');
const ProductController = require('../controllers/ProductController');

router.post('/login', AuthController.login);

router.post('/logout', AuthController.logout);

router.post('/verify', AuthMiddleware.checkAuthenticated, (req, res) =>
  res.status(200).send({ done: true, message: 'Verified' })
);

router.post('/order/place', OrderController.newOrder);

router.get(
  '/order/get',
  AuthMiddleware.checkAuthenticated,
  OrderController.getOrders
);

// router.post(
//   '/order/mark-delivered',
//   AuthMiddleware.checkAuthenticated,
//   OrderController.markDelivered
// );

router.get('/products', ProductController.fetchProducts);
router.get('/products/:id', ProductController.fetchSingleProduct);

// router.post('/verify-coupon', async (req, res) => {
//   if (req.body.coupon === 'MASK100') {
//     res.status(200).json({
//       verified: true,
//       amount: 100,
//       discountType: 'fixed_cart',
//       message: '100 off',
//     });
//   } else if (req.body.coupon === 'MASK10PERCENT') {
//     res.status(200).json({
//       verified: true,
//       amount: 10,
//       discountType: 'percent',
//       message: '10 percent off',
//     });
//   } else {
//     res.status(200).json({
//       verified: false,
//     });
//   }
// });

router.post("/order-cancel-hook", OrderController.orderCancelHook);

router.post("/order/generate-trans-id", OrderController.generateCloseTransId);

module.exports = router;
