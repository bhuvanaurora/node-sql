var mysql = require('mysql');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore')._;
var async = require('async');

module.exports = Connection;
Util.inherits(Connection, EventEmitter);
function Connection(options) {
    EventEmitter.call(this);

    this.mysqlConnectionPool = mysql.createPool(options.config);
    global.connection.mysqlConnectionPool = this.mysqlConnectionPool;
    var self = this;
    if(global.connection.schemas !== undefined || global.connection.schemas !== {}) {
        async.eachSeries(global.connection.createOrder, function(tableName, cb) {
            self.exec_raw_query(global.connection.schemas[tableName].createQuery, function(createResponse) {
                 cb();
            });
        }, function() {
            console.log('Initiation complete');
        });
    }
    return this;
}

Connection.prototype.exec_raw_query = function exec_raw_query(sqlRawQuery, callback) {
    this.mysqlConnectionPool.getConnection(function(err, connection) {
        if(err) throw new Error(err);
        console.log(sqlRawQuery);
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

Connection.prototype.getAll = function getAll(tableName, callback) {
    var sqlQ = 'SELECT * FROM ' + tableName;
    this.exec_raw_query(sqlQ, function(selectResponse) {
        return callback(selectResponse);
    });
}

Connection.prototype.getAllById = function getAllById(tableName, id, callback) {
    var sqlQ = 'SELECT * FROM ' + tableName + ' where id=' + id;
    this.exec_raw_query(sqlQ, function(selectResponse) {
        return callback(selectResponse);
    });
}

Connection.prototype.queryTable = function queryTable(tableName, queryObject, callback) {
    for(var key in queryObject) {
        if(createQuery !== undefined) {
            createQuery += ' and ' + key + '=' + queryObject[key];
        } else {
            var createQuery = key + '=' + queryObject[key];
        }
    }
    var sqlQ = 'SELECT * FROM ' + tableName + ' where ' + createQuery;
    this.exec_raw_query(sqlQ, function(queryResponse) {
        return callback(queryResponse);
    });
}

Connection.prototype._insert = function _insert(tableName, data, callback) {
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
            if(_.find(schema[key], function(val){if("text"===val.toLowerCase() || val.toLowerCase().indexOf("varchar")>-1) return true;}) && data[key]) {
                var values = '"' +data[key]+ '"';
            } else {
                var values = (data[key] || null);
            }
        }
    }
    var sqlQ = 'INSERT INTO '+tableName+' ('+valueNames+') VALUES ('+values+')';
    console.log(sqlQ);
    this.exec_raw_query(sqlQ, function(insertResponse) {
        return callback(insertResponse);
    });
}

function pushToArray(foreignKeyDep, foreignKeyDepOrder, tableName, id, key, referencedTable, referencedKey) {
    if(foreignKeyDep[tableName] === undefined) {
        foreignKeyDep[tableName] = {};
        if(foreignKeyDepOrder.indexOf(referencedTable) === -1 && key === 'foreign') foreignKeyDepOrder.push(tableName);
        else foreignKeyDepOrder.splice(foreignKeyDepOrder.indexOf(referencedTable), 0, tableName);
    }
    if(foreignKeyDep[tableName][id] === undefined) foreignKeyDep[tableName][id] = '';
    if(key === 'foreign') {
        if(foreignKeyDep[tableName]['foreign'] === undefined) foreignKeyDep[tableName]['foreign'] = [];
        var refObj = {
            'table': referencedTable,
            'key': referencedKey,
            'own': id
        }
        foreignKeyDep[tableName]['foreign'].push(refObj);
    }
    return [foreignKeyDep, foreignKeyDepOrder];
}

Connection.prototype.insert = function insert(tables, data, callback) {
    var foreignKeyDep = {};
    var foreignKeyDepOrder = [];
    var self = this;

    // Forming a mapping of data and tables' schema for finding order of insertion
    for(var tableIdx=0; tableIdx<tables.length; tableIdx++) {
        var schema = global.connection.schemas[tables[tableIdx]];
        for(var key in schema) {
             if(key.toLowerCase() === 'foreign_key') {
                for(var forIdx=0; forIdx<schema[key].length; forIdx++) {
                    var returnedValue = pushToArray(foreignKeyDep, foreignKeyDepOrder, schema[key][forIdx][1], schema[key][forIdx][2], 'primary');
                    foreignKeyDep = returnedValue[0];
                    foreignKeyDepOrder = returnedValue[1];
                    var returnedValue = pushToArray(foreignKeyDep, foreignKeyDepOrder, tables[tableIdx], schema[key][forIdx][0], 'foreign', schema[key][forIdx][1], schema[key][forIdx][2]);
                    foreignKeyDep = returnedValue[0];
                    foreignKeyDepOrder = returnedValue[1];
                }
            } else if(_.find(schema[key], function(val){if('primary key'===val.toLowerCase()) return true;})) {
                var returnedValue = pushToArray(foreignKeyDep, foreignKeyDepOrder, tables[tableIdx], key, 'primary');
                foreignKeyDep = returnedValue[0];
                foreignKeyDepOrder = returnedValue[1];
            }
        }
    }

    // Inserting data for each table in the requisite order
    async.eachSeries(foreignKeyDepOrder.reverse(), function iterator(tableName, cb) {
        if(foreignKeyDep[tableName]['foreign'] !== undefined) {
            for(var idx=0; idx<foreignKeyDep[tableName]['foreign'].length; idx++) {
                var refKey = foreignKeyDep[tableName]['foreign'][idx]['key'];
                var refTable = foreignKeyDep[tableName]['foreign'][idx]['table'];
                var own = foreignKeyDep[tableName]['foreign'][idx]['own'];

                foreignKeyDep[tableName][own] = foreignKeyDep[refTable][refKey];
                data[own] = foreignKeyDep[refTable][refKey];
            }
        }
        self._insert(tableName, data, function(insertResponse) {
            for(var keyName in foreignKeyDep[tableName]) {
                if(keyName !== 'foreign') {
                    var query = {};
                    query[keyName] = insertResponse.insertId;
                    if(insertResponse.insertId !== 0) {
                        self.queryTable(tableName, query, function(queryResponse) {
                            foreignKeyDep[tableName][keyName] = queryResponse[0][keyName];
                            return cb();
                        });
                    } else {
                        return cb();
                    }
                }
            }
        });
    }, function() {
        console.log('Done inserting');
        callback(foreignKeyDep);
        // callback();
    });

}

Connection.prototype._getConnection = function _getConnection() {
    return global.connection;
}
