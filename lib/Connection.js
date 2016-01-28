var mysql = require('mysql');
var async = require('async');
var Util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Connection;
Util.inherits(Connection, EventEmitter);
function Connection(options) {
    EventEmitter.call(this);

    this.mysqlConnectionPool = mysql.createPool(options.config);
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

Connection.prototype.Schema = function Schema(schemaObject) {
    for(var tableName in schemaObject) {
        var rowNamesObject = schemaObject[tableName];
        var sqlCreateQuery = 'CREATE TABLE IF NOT EXISTS ';
        for(var rowName in rowNamesObject) {
            if(rowName.toLowerCase() === 'foreign_key') {        // Handling FOREIGN KEYS
                attributes += ', FOREIGN KEY (' + rowNamesObject[rowName][0] + ') REFERENCES ' + rowNamesObject[rowName][1] + '(' + rowNamesObject[rowName][2] + ')';
            } else if(rowName.toLowerCase() === 'unique') {      // Handling UNIQUE KEYS
                attributes += ', UNIQUE (' + rowNamesObject[rowName].join(',') + ')';
            } else {
                if(attributes !== undefined) {
                    attributes += ', ' + rowName + ' ' + rowNamesObject[rowName].join(' ');
                } else {
                    var attributes = rowName + ' ' + rowNamesObject[rowName].join(' ');
                }
            }
        }
        sqlCreateQuery += tableName + ' (' + attributes + ') ENGINE=INNODB;';
        attributes = undefined;         // For next query
        this.exec_raw_query(sqlCreateQuery, function(createResponse) {
            return createResponse;
        });
    }
}