const fastify = require("fastify")({
  logger: true
});

// fastify.register(require("./db"), {
//   url: "mongodb://127.0.0.1:27017/loginserver"
// });
fastify.register(require("./route"));

fastify.listen(3000, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`server listening on ${address}`);
});