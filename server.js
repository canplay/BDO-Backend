const path = require("path");

const fastify = require("fastify")({
  logger: true
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "web")
});
fastify.register(require("fastify-compress"));
fastify.register(require("fastify-cors"), {
  origin: ["http://localhost:8080", "http://127.0.0.1:3000"]
});

// fastify.register(require('fastify-oauth2'), {
//   name: 'facebookOAuth2',
//   credentials: {
//     client: {
//       id: '<CLIENT_ID>',
//       secret: '<CLIENT_SECRET>'
//     },
//     auth: require('fastify-oauth2').FACEBOOK_CONFIGURATION
//   },
// register a fastify url to start the redirect flow
// startRedirectPath: '/login/facebook',
// facebook redirect here after the user login
//   callbackUri: 'http://localhost:3000/login/facebook/callback'
// });

fastify.register(require("./db"), {
  url: "mongodb://127.0.0.1:27017/",
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const moment = require("moment");
moment.locale("zh-cn");

fastify.register(require("./route"), {
  time: moment().unix()
});

fastify.listen(3000, "0.0.0.0", function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log(`server listening on ${address}`);
});
