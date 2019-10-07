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

  let prefix = 0;
  let userList = [];

  // removeUser();

  fastify.get("/home/:type", async (request, reply) => {
    let value;

    switch (request.params.type) {
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

    if (value === null) reply.code(404);
      
    value.toArray(function(err, result) {
      if (err) throw err;
      reply.send(result);
    })
  });

  fastify.get("/markdown", async (request, reply) => {
    let value = await markdownCol.find();

    if (value === null) reply.code(404);
    
    value.toArray(function(err, result) {
      if (err) throw err;
      reply.send(result);
    })
  });

  fastify.get("/news/:id", async (request, reply) => {
    let ObjectId = require('mongodb').ObjectId;

    let value = await newsCol.findOne({ _id: ObjectId(request.params.id) });

    if (value === null) reply.code(404);
    
    reply.send(value);
  });

  fastify.get("/captcha", async (request, reply) => {
    let captcha = svgCaptcha.create();
    let id = Date.now() + (prefix++);

    userList.push({
      id: id,
      captcha: captcha.text
    });

    return {
      id: id,
      captcha: captcha.text
    };
  });

  function check(id, captcha) {
    if (userList.length <= 0) {
      return {
        id: id,
        status: "id error"
      };
    }

    for (let index = 0; index < userList.length; index++) {
      if (userList[index].id === parseInt(id)) {
        if (userList[index].captcha != captcha) {
          return {
            id: id,
            status: "captcha error"
          };
        }

        return {
          id: id,
          status: "success"
        };
      }
    }

    return {
      id: id,
      status: "id error"
    };
  }

  fastify.get("/register/:username/:password", async (request, reply) => {
    // let result = check(request.params.id, request.params.captcha);

    // if (result.status === "success") {
      let value = await accountsCol.findOne({ accountName: request.params.username })

      if (value != null) return "username exit";

      let col = await accountsCol.find().sort({ _id: -1 });
      // let index = 0;
      // col.forEach(item => {
      //   if (index < item._id) index = item._id;
      // });

      let long = require("mongodb").Long;
      let account = require("./account.json");

      account._id = long.fromInt(await col.count() + 1);
      account.accountName = account.email = request.params.username;

      let salt = bcrypt.genSaltSync(10, "a");
      account.password = bcrypt.hashSync(request.params.password, salt);

      account.cash = long.fromInt(0);
      account.registrationDate = long.fromNumber(Date.now());
      account.host = request.ip;

      value = await accountsCol.insertOne(account);

      if (value == null) return "failed";
      else if (!value.result.ok) return "failed";

      userList.pop();

      return "success";
    // }

    // return result.status;
  });

  fastify.get("/login/:username/:password", async (request, reply) => {
    let value = await accountsCol.findOne({ accountName: request.params.username });

    if (value != null) {
      if (!bcrypt.compareSync(request.params.password, value.password))
        return "password error";
      return "success";
    }

    return "username error";
  });

  fastify.get("/admin/:info", async (request, reply) => {
    let value = await accountsCol.findOne({ accountName: request.params.username });

    if (value != null) {
      if (!bcrypt.compareSync(request.params.password, value.password))
        return "password error";
      return "success";
    }

    return "username error";
  });

  function removeUser() {
    console.log(userList);
    userList.pop();
    console.log(userList);
    setTimeout(removeUser, 18000);
  }
}

module.exports = routes;
