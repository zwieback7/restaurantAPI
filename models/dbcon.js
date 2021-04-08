const config = require('../config.json');
const couchbase = require('couchbase');

const cluster = new couchbase.Cluster(config.couchbase.server, {
    username: config.couchbase.username,
    password: config.couchbase.password
});
const collection = cluster.bucket(config.couchbase.bucket).defaultCollection();

module.exports = {cluster, collection};