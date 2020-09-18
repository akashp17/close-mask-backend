const axios = require('axios');
const { SHOPIFY_APP_KEY, SHOPIFY_PASSWORD, SHOPIFY_SHOP_NAME } = process.env;
const apiUrl = `https://${SHOPIFY_APP_KEY}:${SHOPIFY_PASSWORD}@${SHOPIFY_SHOP_NAME}`;

const fetchProducts = async (req, res) => {
  //consloe.log('hello');
  try {
    const { data } = await axios.default.get(
      `${apiUrl}/admin/api/2020-07/products.json?collection_id=198843695272&limit=250`
      // `${apiUrl}/admin/api/2020-07/products.json`
    );
    let result;
    if (process.env.NODE_ENV === 'production') {
      const maskIds = [
        5426283675816,
        5426932187304,
        5426701009064,
        5426916753576,
        5426949324968,
        5426978783400,
        5427033702568,
        5255541358760,
        5255651557544,
        5255651950760,
        5255652311208,
        5255652671656,
        5255652933800,
        5255653195944,
        5255654277288,
        5255654506664,
        5255652475048,
        5255651360936,
        5255653687464,
        5255654113448,
        5255654867112,
        5255654670504,
        5255654768808,
        5255651131560,
        5255651229864,
        5394342215848,
        5394356109480,
        5394362564776,
        5394367545512,
        5394385600680,
        5394401853608,
      ];
      result = data.products.filter((item) => maskIds.includes(item.id));
    } else {
      result = data.products;
    }

    return res.send(result);
  }
  catch (err) {
    res.status(500).send({ done: false, message: err.message });
    console.log(err);
  }
};
const fetchSingleProduct = async (req, res) => {
  // console.log(req.params.id);
  const { data } = await axios.default.get(
    `${apiUrl}/admin/api/2020-07/products/${req.params.id}.json`
  );
  // console.log(data);

  return res.send(data);
};
module.exports = {
  fetchProducts,
  fetchSingleProduct,
};
