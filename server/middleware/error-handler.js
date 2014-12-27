/*!
 * module dependencies
 * adapted from (errorhandler)[https://github.com/expressjs/errorhandler]
 */
var accepts = require('accepts');

/*!
 * constants
 */
var ENV = process.env.NODE_ENV || 'development';

/**
 * Error handler
 */
function errorHandler(err, req, res, next) {

  // respect err.status; default status is 500.
  if (err.status) res.statusCode = err.status;
  if (res.statusCode < 400) res.statusCode = 500;

  // in case we've already responded.
  if (res._header) return req.socket.destroy();

  // force IE & Chrome to respect content type.
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // content negotiation
  var accept = accepts(req);
  var type = accept.types('html', 'json', 'text');

  // hackish way to show the stack @TODO: is this necessary?
  var error = {message: err.message};
  for (var key in err) { error[key] = err[key]; }
  error.stack = err.stack || '';

  // In production, you may want to log errors (including a stack trace) on the
  // server as well as sending them to the client.
  if (ENV == 'production' && res.statusCode > 499) console.error(error);

  // only send a stack trace to the client during development.
  if (ENV != 'development') delete error.stack;

  // render an html error page.
  if (type == 'html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.render(res.statusCode + '', {error: error}, function(err, html) {

      // this results in an infinite loop if there is no 500.html view...
      // so make sure you have a 500.html view!
      if (err) {
        err.status = 500;
        return errorHandler(err, req, res, next);
      }

      res.send(html);
    });
  }

  // send the json error.
  if (type == 'json') {
    res.setHeader('Content-Type', 'application/json');
    return res.json({error: error});
  }

  // send a simple error message.
  if (type == 'text') {
    res.setHeader('Content-Type', 'text/plain');
    return res.send(error.message);
  }
}

/*!
 * exports
 */
module.exports = errorHandler;
