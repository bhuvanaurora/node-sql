var async = require('async');
var Connection = require('./Connection');

module.exports = Schema;
function Schema(schemaObject) {
    async.forEachOfSeries(schemaObject, function(rowNamesObject, tableName, callback) {
        var sqlCreateQ = 'CREATE TABLE IF NOT EXISTS ' + tableName;
        for(var rowName in rowNamesObject) {
            if(rowName.toLowerCase() === 'foreign_key') {        // Handling FOREIGN KEYS
                attributes += ', FOREIGN KEY (' + rowNamesObject[rowName][0] + ') REFERENCES ' + rowNamesObject[rowName][1] + '(' + rowNamesObject[rowName][2] + ')';
            } else if(rowName.toLowerCase() === 'unique') {
                attributes += ', UNIQUE (' + rowNamesObject[rowName].join(',') + ')';
            } else {
                if(attributes !== undefined) {
                    attributes += ', ' + rowName + ' ' + rowNamesObject[rowName].join(' ');
                } else {
                    var attributes = rowName + ' ' + rowNamesObject[rowName].join(' ');
                }
            }
        }
        var sqlCreateQuery = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + attributes + ') ENGINE=INNODB;';
        attributes = undefined;         // For next query
        // #TODO: Figure out a way to make this code common
        var conPool = Connection({
            connectionLimit : 100,
            host : mysql.host,
            user : mysql.user,
            password : mysql.password,
            database : mysql.database,
            debug : false
        });
        connPool.getConnection(function(err, connection) {
            if(err) throw new Error(err);
            connection.query(sqlCreateQuery, function(er, result) {
                connection.release();
                if(er) throw new Error(er);
                callback(result);
            });
        });
    });
}
