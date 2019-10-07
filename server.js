const path = require('path')

const fastify = require("fastify")({
  logger: true
});

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, "web")
})

fastify.register(require("./db"), {
  url: "mongodb://127.0.0.1:27017/",
  useNewUrlParser: true,
  useUnifiedTopology: true
});
fastify.register(require("./route"));
fastify.register(require("fastify-cors"), {
  origin: [ "http://localhost:8080", "http://127.0.0.1:3000" ]
});

fastify.listen(3000, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log(`server listening on ${address}`);
});
