const cron = require("cron");
const https = require("https");

const url = "https://odin-blog-api.onrender.com/blog";

const job = new cron.CronJob("*/14 * * * *", function () {
  // server 8 hours ahead of local time.
  const hour = new Date().getHours();

  if (hour > 16 && hour < 4) {
    // 8am to 8pm PST => server 8 hours ahead
    console.log(`Current hour: ${hour}. Waking up server...`);
    https
      .get(url, (res) => {
        if (res.statusCode === 200) {
          console.log("Server restarted");
        } else {
          console.error(`Error occurred with status code: ${res.statusCode}`);
        }
      })
      .on("error", (err) => {
        console.error("Error occurred during server wakeup: ", err.message);
      });
  } else {
    console.log(`Current hour: ${hour}. Inactive hour`);
  }
});

module.exports = job;
