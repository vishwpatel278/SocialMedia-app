const {createClient} = require("redis");

const client = createClient(process.env.REDIS_PORT);

client.on("error", (err) => {
    console.log("Redis Error:", err);
});

(async () => {
    await client.connect();
    console.log("Redis Connected");
})();

module.exports = client;