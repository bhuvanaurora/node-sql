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
                // console.log(createResponse);
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

Connection.prototype.insert = function(tableName, data, callback) {
    var schema = global.connection.schemas[tableName];
    for(var key in schema) {
        if(key.toLowerCase() === 'foreign_key' || key.toLowerCase() === 'unique' || key === 'createQuery') continue;
        if(valueNames) {
            valueNames += ', '+ key;
            if(_.find(schema[key], function(val){if("TEXT"===val || val.indexOf("VARCHAR")>-1) return true;}) && data[key]) {
                values += ', "' +data[key]+ '"';
            } else {
                values += ', ' + (data[key] || null);
            }
        } else {
            var valueNames = key;
            if(tableName != 'hotelDetails' && key == 'hotelId') {
                var values = '?';
            } else {
                if(_.find(schema[key], function(val){if("TEXT"===val || val.indexOf("VARCHAR")>-1) return true;}) && data[key]) {
                    var values = '"' +data[key]+ '"';
                } else {
                    var values = (data[key] || null);
                }
            }
        }
    }
    var sqlQ = 'INSERT INTO '+tableName+' ('+valueNames+') VALUES ('+values+')';
    this.exec_raw_query(sqlQ, function(insertResponse) {
        return callback(insertResponse);
    });
}

Connection.prototype._getConnection = function _getConnection() {
    return global.connection;
}