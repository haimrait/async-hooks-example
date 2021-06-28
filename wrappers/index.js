const { patchMongoose } = require('./mongooseWrapper');
const { patchRedis } = require('./redisWrapper');

module.exports = {
    patchMongoose,
    patchRedis
}