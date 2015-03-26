/*!
 * module dependencies
 */
import compression from 'compression';
import {renderFile as ejs} from 'ejs';
import errorHandler from './middleware/error-handler';
import express from 'express';
import favicon from 'serve-favicon';
import path from 'path';
import serveStatic from 'serve-static';
import urlNotFound from './middleware/url-not-found';

import PACKAGE from '../../package.json';
import PATHS from '../../paths.json';
import {path as ROOT} from 'app-root-path';
const STATIC = path.resolve(ROOT, PATHS.CLIENT.BUILD);
const VIEWS = path.resolve(ROOT, PATHS.CLIENT.VIEWS);

/**
 * Server Application
 */
var app = express();

// configuration
app.set('env', process.env.NODE_ENV || 'development');
app.set('port', 3000);
app.set('version', PACKAGE.version);

app.locals.ENV = app.get('env');
app.locals.PORT = app.get('port');
app.locals.VERSION = app.get('version');

// view engine
app.engine('html', ejs);
app.set('view engine', 'html');
app.set('views', VIEWS);

// favicon.ico -- uncomment after creating 'client/img/favicon.ico'
// app.use(favicon(path.join(STATIC, 'img', 'favicon.ico')));

// request pre-processing middleware
app.use(compression());


// -------------------------------------------------------
// --- Add any application middleware and routing here ---
// -------------------------------------------------------


// Serve the index view -- this works well if you're building a Single Page App
// and a frontend framework (like Angular) will handle view routing.
//
// Given the specific requirements of your application, you may want to alter or
// remove this route altogether.
app.get('/', function(req, res) {
  res.render('index');
});

// Serve static files -- if a request gets this far, it hits the file system.
app.use(serveStatic(STATIC));

// If a request isn't handled by any middleware or routes, treat it as a 404.
app.use(urlNotFound);

// Application error handler.
app.use(errorHandler);

app.start = function() {
  app.listen(app.get('port'), function(err) {
    if (err) return console.error(err);
    console.log('Application server listening on port %d', app.get('port'));
  });
};

// The server may be started directly, or required into another module.
if (require.main === module) {
  app.start();
}

export default app;
