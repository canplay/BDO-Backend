async function routes(fastify, options) {
  //   const database = fastify.mongo.db;
  //   const collection = database.collection("accounts");
  const svgCaptcha = require("svg-captcha");

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
    reply
      .type("svg")
      .code(200)
      .send(captcha.text);
  });

  fastify.get("/register/:username", async (request, reply) => {
      return request.params.username + " - " + request.params.password + " - " + request.params.captcha;
    // const result = await collection.findOne({ id: request.params.id });
    // if (result.value === null) {
    //   throw new Error("Invalid value");
    // }
    // return result.value;
  });
}

module.exports = routes;
