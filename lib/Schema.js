var Connection = require('./Connection');
var _ = require('underscore')._;    // Not used yet
var async = require('async');       // Not used yet

module.exports = Schema;
function Schema(schemaObject) {
    for(var tableName in schemaObject) {
        if(global.connection === undefined) global.connection = {};
        if(global.connection.schemas === undefined) global.connection.schemas = {};

        var rowNamesObject = schemaObject[tableName];
        var sqlCreateQuery = 'CREATE TABLE IF NOT EXISTS ';

        for(var rowName in rowNamesObject) {
            if(rowName.toLowerCase() === 'foreign_key') {        // Handling FOREIGN KEYS
                attributes += ', FOREIGN KEY (' + rowNamesObject[rowName][0] + ') REFERENCES ' + rowNamesObject[rowName][1] + '(' + rowNamesObject[rowName][2] + ')';

                if(global.connection.schemas.foreign_key === undefined) global.connection.schemas[tableName].foreign_key = [];
                global.connection.schemas[tableName].foreign_keys.push({rowNamesObject[rowName][1] : rowNamesObject[rowName][2]});

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
        global.connection.schemas[tableName] = schemaObject[tableName];
        global.connection.schemas[tableName].createQuery = sqlCreateQuery;
    }
}