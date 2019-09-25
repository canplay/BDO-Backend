async function routes(fastify, options) {
  const database = fastify.mongo.db("loginserver");
  const collection = database.collection("accounts");
  const svgCaptcha = require("svg-captcha");
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
      update: "http://60.160.237.49/update.exe",
      version: "1.0.2",
      server: "60.160.237.49"
    };
  });

  fastify.get("/captcha", async (request, reply) => {
    let id = request.id + new Date(Date.now()).getTime();
    let captcha = svgCaptcha.create();

    userList.push({ id: id, captcha: captcha.text });

    return {
      id: id,
      captcha: captcha.text
    };
  });

  fastify.get("/register/:id/:captcha/:username/:password", async (request, reply) => {
    let result;

    if (userList.length <= 0) result = "id error";

    for (let index = 0; index < userList.length; index++) {
      if (userList[index].id != request.params.id) {
        result = "id error"
        break;
      }
      else {
        if (userList[index].captcha != request.params.captcha) {
          result = "captcha error"
          break;
        }

        // result = await collection.findOne({ accountName: request.params.username })
        // if (result._id === null) {

        // collection.insertOne(myobj, function(err, res) {
        //   if (err) return err;
        return "success";
        // });
        // }
        // else {
        //   return "username exist";
        // }
      }
    };

    return "";
  });

  function removeUser() {
    console.log(userList);
    userList.pop();
    console.log(userList);
    setTimeout(removeUser, 18000);
  };
}

module.exports = routes;
