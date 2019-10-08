async function routes(fastify, options) {
  const loginserver = fastify.mongo.db("loginserver");
  const accountsCol = loginserver.collection("accounts");

  const web = fastify.mongo.db("web");
  const newsCol = web.collection("news");
  const slideCol = web.collection("slide");
  const configCol = web.collection("config");
  const markdownCol = web.collection("markdown");

  const svgCaptcha = require("svg-captcha");
  const bcrypt = require("bcrypt");

  fastify.get("/home/:type", async (req, reply) => {
    let value;

    switch (req.params.type) {
      case "news":
        value = await newsCol.find();
        break;
      case "slide":
        value = await slideCol.find();
        break;
      case "config":
        value = await configCol.find();
        break;
    }

    if (value === null) return { status: 0 };

    let result = await value.toArray();
    return { status: 1, msg: result };
  });

  fastify.get("/markdown", async (req, reply) => {
    let value = await markdownCol.find();

    if (value === null) return { status: 0 };

    let result = await value.toArray();
    return { status: 1, msg: result };
  });

  fastify.get("/news/:id", async (req, reply) => {
    let ObjectId = require("mongodb").ObjectId;

    let value = await newsCol.findOne({ _id: ObjectId(req.params.id) });

    if (value === null) reply.code(404).send();

    return { status: 1, msg: value };
  });

  fastify.get("/captcha", async (req, reply) => {
    let captcha = svgCaptcha.create();
    return { status: 1, msg: captcha.text };
  });

  fastify.post("/login", async (req, reply) => {
    let value = await accountsCol.findOne({
      accountName: req.body.username
    });

    if (value != null) {
      if (!bcrypt.compareSync(req.body.password, value.password))
        return { status: 0, msg: "password error"};

      const uuid = require("uuid/v4");
      return { status: 1, msg: uuid() + "-" + uuid() };
    }

    return { status: 0, msg: "username error" };
  });

  fastify.post("/register", async (req, reply) => {
    let value = await accountsCol.findOne({
      accountName: req.body.username
    });

    if (value != null) return { status: 0, msg: "username exit" };

    let col = await accountsCol.find().sort({ _id: -1 });

    let long = require("mongodb").Long;
    let account = require("./account.json");

    account._id = long.fromInt((await col.count()) + 1);
    account.accountName = account.email = req.body.username;

    let salt = bcrypt.genSaltSync(10, "a");
    account.password = bcrypt.hashSync(req.body.password, salt);

    account.cash = long.fromInt(0);
    account.registrationDate = long.fromNumber(Date.now());
    account.host = req.ip;

    value = await accountsCol.insertOne(account);

    if (value == null) return { status: 0 };
    else if (!value.result.ok) return { status: 0 };

    return { status: 1, msg: "success" };
  });
}

module.exports = routes;
