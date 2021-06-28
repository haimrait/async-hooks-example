const { get } = require("http");
const redis = require("redis");
const { promisify } = require("util");
const { patchRedis } = require('../wrappers');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

this.getAsync = promisify(client.get).bind(client);
this.setAsync = promisify(client.set).bind(client);

patchRedis(this); 

module.exports.getFromRedis = async (key) => {
    const element = await this.getAsync(key);
    if (element) return JSON.parse(element);
}

module.exports.setToRedis = async (key, element, ttl = 10) => {
    await this.setAsync(key, JSON.stringify(element), 'EX', ttl)
}
