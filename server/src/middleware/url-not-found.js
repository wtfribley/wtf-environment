/*!
 * inspired by (loopback)[https://github.com/strongloop/loopback/blob/master
 * /server/middleware/url-not-found.js]
 */

function urlNotFound(req, res, next) {
  var error = new Error('Cannot ' + req.method + ' ' + req.url);

  error.status = 404;
  error.method = req.method;
  error.url = req.url;

  next(error);
}

module.exports = urlNotFound;
