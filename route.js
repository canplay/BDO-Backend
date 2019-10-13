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

  const moment = require("moment");

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

    if (value === null) return { status: 0 };

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
        return { status: 0, msg: "password error" };

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

    const uuid = require("uuid/v4");
    return { status: 1, msg: uuid() + "-" + uuid() };
  });

  fastify.post("/overview", async (req, reply) => {
    if (!req.body.token) return { status: 0 };

    let ObjectId = require("mongodb").ObjectId;
    let value, result;

    switch (req.body.methond) {
      case "time":
        return {
          status: 1,
          msg: {
            time: moment().unix(),
            runtime: options.time
          }
        };
      case "save":
        configCol.updateOne(
          { _id: ObjectId("5d9a3741a47c000074001b06") },
          {
            $set: {
              version: req.body.version,
              update: req.body.update,
              launcher: req.body.launcher,
              server: req.body.server,
              forum: req.body.forum,
              discord: req.body.discord,
              facebook: req.body.facebook,
              twitter: req.body.twitter,
              weibo: req.body.weibo,
              weixin: req.body.weixin
            }
          },
          function(err, res) {
            if (err) return { status: 0, msg: err };
            return { status: 1 };
          }
        );

        return { status: 1 };
      case "download":
        markdownCol.updateOne(
          { _id: ObjectId("5d9b1e0dad46000091007c02") },
          {
            $set: {
              download: req.body.markdown
            }
          },
          function(err, res) {
            if (err) return { status: 0, msg: err };
            return { status: 1 };
          }
        );

        return { status: 1 };
      case "about":
        markdownCol.updateOne(
          { _id: ObjectId("5d9b1e0dad46000091007c02") },
          {
            $set: {
              about: req.body.markdown
            }
          },
          function(err, res) {
            if (err) return { status: 0, msg: err };
            return { status: 1 };
          }
        );

        return { status: 1 };
      default:
        value = await configCol.find();

        if (value == null) return { status: 0 };

        result = await value.toArray();

        return {
          status: 1,
          msg: {
            time: moment().unix(),
            runtime: options.time,
            launcher: result[0].launcher,
            version: result[0].version,
            update: result[0].update,
            server: result[0].server,
            forum: result[0].forum,
            discord: result[0].discord,
            facebook: result[0].facebook,
            twitter: result[0].twitter,
            weibo: result[0].weibo,
            weixin: result[0].weixin
          }
        };
    }
  });
}

module.exports = routes;
