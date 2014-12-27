# WTF Dev Environment

This repository is meant to help folks get a head start on building Node+Angular web applications. It comes with some nifty Gulp tasks, a skeleton Express server ready for your custom middleware and routing, some Sublime Text packages and settings and bunches of other helpful stuff!

#### Paths

The first thing to familiarize yourself with is the `paths.json` file in the root of this repository. It defines glob patterns which Gulp uses to gather up files to be processed by the various tasks. You may customize your project's structure by altering these paths, although they have been chosen carefully and will work well for a large-scale Angular web application.

## Gulp Tasks

[Gulp](http://gulpjs.com/) is a fantastic streaming build system. The **WTF Dev Environment** comes with some tasks for building and developing an Angular app. To run any of these tasks just issue this command from the repo's root directory:

```
$ gulp [name of task]
```

In most cases, before you start working, you'll simply want to run the default task:

```
$ gulp
```

This will build the project and then watch its files -- linting, testing and live-reloading when you change anything.

*NOTE: The default `index.html` file loads two Javascript files: `bundle.js` and `templates.js` -- until you've added some HTML templates to your Angular app under `client/app`, the `templates.js` file will not exist. So don't be alarmed if you see it 404 when you first look at the project.*

For more a detailed look at what you can do with Gulp, here's a quick run-down of all the included tasks.

#### QA (Linting & Testing)

This repository contains both `.jshintrc` and `.jscsrc` files. [JSHint](http://jshint.com/) is used to catch language errors -- unused or undefined variables, for example -- while
[JSCS](https://www.npmjs.com/package/jscs) enforces coding style. Feel free to alter these two configuration files as
you see fit.

There is also a `karma.conf.js` file to configure [Karma](http://karma-runner.github.io/0.12/index.html), a front-end test runner.

QA tasks are split into client and server groups.

- **server-qa**
    + **server-lint** run JSHint and JSCS on all server files and server tests.
    + **server-unit-test** use Mocha to run all server unit tests.
    + **server-e2e-test** use Mocha to run all server end-to-end tests (integration, acceptance, etc.).
- **client-qa**
    + **client-lint** run JSHint and JSCS on all client files and client tests.
    + **client-unit-test** use Karma to run all client unit tests.
    + **client-e2e-test** use Protractor to run Angular end-to-end tests *this task is currently **not** implemented*

#### Build

Modern web applications require a build process -- from compiling SASS into CSS, bundling and minifying Javascript, moving other static assets into a publicly-served location, etc. The **WTF Dev Environment** includes build tasks to make this process totally painless.

**WTF** uses [Browserify](http://browserify.org/) to bundle front-end Javascript (e.g. an Angular application -- or, with a little customization, Ember, React, Backbone, etc.). If you're unfamiliar with Browserify, please check out their documentation. In short, Browserify allows you to break your front-end code into modules just like using Node for back-end code -- it does a bunch of other cool stuff, too, but that bit is the most relevant here. So font-end dependencies are managed via the familiar `require` syntax.

```js
var angular = require('../../bower_components/angular/angular');
var myModule = require('./path/to/file');
```

Check out `client/app/app.js` to see how this works. And keep in mind, you should always require the full development versions of any dependencies -- the build process will minify the entire Javascript bundle.

Here's a list of build tasks.

- **build**
    + **browserify** Use Browserify to bundle front-end Javascript, using the `CLIENT.APP.ENTRY` path from `paths.json`. This task will also use `ngAnnotate` to make any Angular dependency injections safe for minification. Finally, the task will produce two files: `bundle.js` and `bundle.min.js`.
    + **fonts** Copy font files into the build directory.
    + **images** Copy images into the build directory.
    + **sass** Use libsass (via the `gulp-sass > node-sass > libsass` chain) to compile SASS into CSS. This task also uses the `gulp-sass-deps` plugin to automatically maintain a SASS entry file which imports all other SASS files. You can read its documentation to learn more. Finally, both full and minified CSS files are saved into the build directory.
    + **templates** Gather all HTML templates (aka "partials"), minify them and use `ngHtml2Js` to add them to Angular's template cache. The cached templates will be added to an Angular module matching the name of the project from `package.json`.

#### Development

This repository also contains a task to launch the application server, as well as watch all project files to lint, test, build and reload on changes.

- **server** Spawn the application server found at the `SERVER.APP.ENTRY` path.
- **watch** Watch all files, server and client, linting, testing, building and live-reloading on changes. If any server files (or server tests) are changed, the application server will be restarted.

The **watch** task will also launch a LiveReload server. Use a free [browser extension](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions) (or include some extra Javascript) to enable live reloading of CSS, HTML and Javascript.

#### gulp-sass-deps

As mentioned above, this repository includes a Gulp plugin that maintains a SASS "entry" file -- it finds all SASS files beginning with `_`, creates an `@import` statement and passes that along to `gulp-sass`. These means you can create a bunch of modular SASS files, organized by feature in your Angular app, without having to manually `@import` them all into your main SASS file.

Eventually, this plugin will be broken out into its own repository, but it will remain here for now. At that time, more detailed documentation will be written -- for now, the code is well-commented.

## The Server

**WTF Dev Environment** comes with a skeleton [Express](http://expressjs.com/) server, configured with some helpful middleware, ready for you to add your own application logic. If you're using a framework on top of Express (like Loopback), you may need to monkey about with the server side quite a bit -- but for your average Single Page App + simple API, you'll be all good to go!

#### Server Views

The server is configured to use `ejs` for templating. The `CLIENT.VIEWS` path in `paths.json` points to the directory where Express will look for views to render. In the case of a Single Page App, there may only be an `index.html` and a set of error pages (error pages should be named for their HTTP status code, like `404.html` or `500.html`).

## Sublime Text

[Sublime Text 3](http://www.sublimetext.com/3) is a pretty fantastic editor. This repo includes the Package Control plugin, as well as some settings which will automatically install several other useful plugins. Simply follow these steps to set up Sublime Text the **WTF** way.

1. Download and install Sublime Text 3
2. Navigate to Sublime's configuration directory -- on Linux this is probably `~/.config/sublime-text-3/`.
3. Copy the files from this repository's `sublime` directories into their corresponding locations in the Sublime Text config directory.
4. Remove the `sublime` directory from this repo.
5. Profit.

Keep in mind that, because this repository contains `.sublime-settings` files, they haven't been added to `.gitignore`. Once you've removed the sublime directory, you may want to add this line to the `.gitignore` file:

```
*.sublime-*
```

## The Foundation Branch

The product design firm [ZURB](http://zurb.com/) maintains an open-source SASS/Angular framework called [Foundation for Apps](http://foundation.zurb.com/apps/) -- it builds upon their previous work, now known as [Foundation for Sites](http://foundation.zurb.com/). It's still a new project and not very stable, but it shows a lot of promise. For that reason, it's included on a separate branch of this repository -- along with some extra Gulp tasks and other tweaks to get Foundation for Apps up and running.
