var mysql = require('mysql');
var async = require('async');

module.exports = Connection;
function Connection(options) {
    var connectionObject = {};
    async.forEachOf(options, function(option, key, callback) {
        connectionObject[key] = option;
        callback();
    }, function() {
        return mysql.createPool(connectionObject);
    });
}
