var Connection = require('./Connection');

module.exports = Schema;
function Schema(schemaObject) {
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
        if(global.connection === undefined) global.connection = {};
        if(global.connection.schemas === undefined) global.connection.schemas = {};
        global.connection.schemas[tableName] = schemaObject[tableName];
        global.connection.schemas[tableName].createQuery = sqlCreateQuery;
        // this.exec_raw_query(sqlCreateQuery, function(createResponse) {
        //     return createResponse;
        // });
    }
}