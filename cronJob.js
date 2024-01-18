const cron = require("cron");
const https = require("https");

const url = "https://odin-blog-api.onrender.com/blog";

const job = new cron.CronJob("*/14 * * * *", function () {
  console.log("Wake up server");

  https
    .get(url, (res) => {
      if (res.ok) {
        console.log("Server awakek");
      } else {
        console.error(
          `failed to wake up server with status code ${res.statusCode}`
        );
      }
    })
    .on(error, (err) => {
      console.error("Error during server restart: ", err.message);
    });
});

module.exports = { job };
