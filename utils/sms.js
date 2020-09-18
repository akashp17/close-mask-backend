var plivo = require("plivo");
var plivoConfig = require("../config/plivo.json");

module.exports.sendSms = (numbers, msg) => {
  let client = new plivo.Client(plivoConfig.AUTH_ID, plivoConfig.AUTH_TOKEN);
  var numbersWithCountryCode = numbers.map(number => "+" + number)
  return client.messages.create(
    plivoConfig.SOURCE_NAME,
    numbersWithCountryCode.join('<'),
    msg
  );
}
