const cron = require("cron");
const https = require("https");

const url = "https://odin-blog-api.onrender.com/blog";

const job = new cron.CronJob("*/14 * * * *", function () {
  console.log("Waking up server...");

  https
    .get(url, (res) => {
      console.log(res);
      if (res.statusCode === 200) {
        console.log("Server restarted");
      } else {
        console.error(`Error occurred with status code: ${res.statusCode}`);
      }
    })
    .on("error", (err) => {
      console.error("Error occurred during server wakeup: ", err.message);
    });
});

module.exports = job;
