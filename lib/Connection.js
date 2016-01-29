var mysql = require('mysql');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Connection;
Util.inherits(Connection, EventEmitter);
function Connection(options) {
    EventEmitter.call(this);

    this.mysqlConnectionPool = mysql.createPool(options.config);
    global.connection.mysqlConnectionPool = this.mysqlConnectionPool;
    if(global.connection.schemas !== undefined || global.connection.schemas !== {}) {
        for(var key in global.connection.schemas) {
            this.exec_raw_query(global.connection.schemas[key].createQuery, function(createResponse) {
                console.log(createResponse);
            });
        }
    }
    return this;
}

Connection.prototype.exec_raw_query = function exec_raw_query(sqlRawQuery, callback) {
    this.mysqlConnectionPool.getConnection(function(err, connection) {
        if(err) throw new Error(err);
        connection.query(sqlRawQuery, function(er, result) {
            connection.release();
            if(er) throw new Error(er);
            return callback(result);
        });
    });
}

// Needs to be tested for failure cases
Connection.prototype.exec_transaction = function exec_transaction(trans, callback) {     // array of transactions
    this.mysqlConnectionPool.getConnection(function(err, connection) {
        if(err) throw new Error(err);
        connection.beginTransaction(function(er) {
          if(er) throw new Error(er);
          for(var i; i<trans.length; i++) {
            connection.query(trans[i], function(e, result) {
                if(e) {
                    connection.rollback(function() {
                        throw new Error(e);
                    });
                }
            });
          }
          connection.commit(function(e) {
            if(e) {
                connection.rollback(function() {
                    throw new Error(e);
                });
            }
            connection.release();
            return callback("Transaction complete");
          });
        });
      });
}

Connection.prototype._getConnection = function _getConnection() {
    return global.connection;
}