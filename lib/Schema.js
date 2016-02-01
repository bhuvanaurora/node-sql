var Connection = require('./Connection');
var async = require('async');       // Not used yet

module.exports = Schema;
function Schema(schemaObject) {
    for(var tableName in schemaObject) {
        if(global.connection === undefined) global.connection = {};
        if(global.connection.schemas === undefined) global.connection.schemas = {};
        if(global.connection.createOrder === undefined) global.connection.createOrder = [];

        global.connection.createOrder.push(tableName);

        var rowNamesObject = schemaObject[tableName];
        var sqlCreateQuery = 'CREATE TABLE IF NOT EXISTS ';

        for(var rowName in rowNamesObject) {
            if(rowName.toLowerCase() === 'foreign_key') {        // Handling FOREIGN KEYS
                for(var forIdx=0; forIdx<rowNamesObject[rowName].length; forIdx++) {
                    attributes += ', FOREIGN KEY (' + rowNamesObject[rowName][forIdx][0] + ') REFERENCES ' + rowNamesObject[rowName][forIdx][1] + '(' + rowNamesObject[rowName][forIdx][2] + ')';
                }
            } else if(rowName.toLowerCase() === 'unique') {      // Handling UNIQUE KEYS
                for(var unIdx=0; unIdx<rowNamesObject[rowName].length; unIdx++) {
                    attributes += ', UNIQUE (' + rowNamesObject[rowName][unIdx].join(',') + ')';
                }
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
        global.connection.schemas[tableName] = schemaObject[tableName];
        global.connection.schemas[tableName].createQuery = sqlCreateQuery;
    }
}