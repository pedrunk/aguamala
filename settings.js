module.exports = function(app, configurations, express) {
  //Module dependencies.
  var nconf = require('nconf');
  var RedisStore = require("connect-redis")(express);
  var clientRedis = require("redis").createClient();
  
  //var maxAge = 24 * 60 * 60 * 1000 * 28; //4 weeks
  var csrf = express.csrf();
  //local conf 
  nconf.argv().env().file({ file: 'local.json' });
  //configure
  app.configure(function () {
    //views
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    //uses
    app.use(express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: nconf.get('session_secret'),
        store: new RedisStore({ host: 'localhost', port: nconf.get('session_port'), client: clientRedis })
    }));    
    app.use(express.logger());
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.enable('trust proxy');
    app.locals.pretty = true;
    app.locals.compileDebug = false;
    app.locals.csrf = csrf;
    app.use(app.router);
    app.use(function (req, res, next) {
      res.status(404);
      res.render('404', { url: req.url, layout: false });
      return;
    });
    app.use(function (req, res, next) {
      res.status(403);
      res.render('403', { url: req.url, layout: false });
      return;
    });
  });
  //Configure production
  app.configure('prod', function() {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('500', { error: err, layout: false });
    });
    app.use(express.errorHandler());
  });
  return app;
  };
