async function routes(fastify, options) {
  const database = fastify.mongo.db("loginserver");
  const collection = database.collection("accounts");
  const svgCaptcha = require("svg-captcha");
  const bcrypt = require("bcrypt");

  let prefix = 0;
  let userList = [];

  // removeUser();

  fastify.get("/", async (request, reply) => {
    return {
      news: [
        {
          title: "test new 1",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 2",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 3",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 4",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 5",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 6",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 7",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        },
        {
          title: "test new 8",
          icon: "bluetooth",
          href: "http://www.baidu.com"
        }
      ],
      banner: [
        {
          title: "test 1",
          img:
            "http://img.kuai8.com/attaches/news/image/20170721/20170721144812_26064.jpg",
          href: "http://www.baidu.com"
        },
        {
          title: "test 2",
          img:
            "http://s1.pearlcdn.com/Upload/Community/ecce4e8d47220180428001515606.jpg",
          href: "http://www.baidu.com"
        },
        {
          title: "test 3",
          img:
            "http://s1.pearlcdn.com/Upload/WALLPAPER/d5e8846471920170327181306477.jpg",
          href: "http://www.baidu.com"
        }
      ],
      update: "http://127.0.0.1/update.exe",
      version: "1.0.2",
      server: "127.0.0.1"
    };
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

  fastify.get("/register/:id/:captcha/:username/:password", async (request, reply) => {
    let result = check(request.params.id, request.params.captcha);

    if (result.status === "success") {
      let value = await collection.findOne({ accountName: request.params.username })

      if (value != null) return "username exit";

      let col = await collection.find().sort({ _id: -1 });
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

      value = await collection.insertOne(account);

      if (value == null) return "failed";
      else if (!value.result.ok) return "failed";

      userList.splice(userList.indexOf(result.id), 1);

      return "success";
    }

    return result.status;
  });

  fastify.get("/login/:username/:password", async (request, reply) => {
    let value = await collection.findOne({ accountName: request.params.username });

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
