The library uses node-mysql (native Node.js driver) for connecting to Node.js and pooling connections. The library takes care of connection pooling for you.

var conn = nodeSql.createConnection({
    connectionLimit : 100,
    host : 'localhost',
    user : 'paytm',
    password : 'paytm',
    database : 'testsql',
    debug : false
});

Options for creating a connection (Same as for node-mysql):
host (Default 'localhost')
port (Default 3306)
localAddress
socketPath
user
password
database
connectTimeout (Default 10 * 1000)
insecureAuth (Default false)
supportBigNumbers (Default false)
bigNumberStrings (Default false)
dateStrings (Default false)
debug
trace
stringifyObjects (Default false)
timezone (Default 'local')
flags
queryFormat
pool

conn.getAll(tableName, function(response) {
    // response gives all the rows and columns from table tableName
    console.log(response);
});

conn.getAllById(tableName, id, function(response) {
    // response gives all the columns from table tableName searching by id
    console.log(response);
});


/*
    queryObject: {'name': 'Comedy', 'type': 'Furrow'}
*/
conn.queryTable(tableName, queryObject, function(queryResponse) {
    // queryResponse gives all the columns from table tableName on searching by queries in queryObject
    console.log(queryResponse);
});

/*
    data object must have all the necessary fields.
    data: {'name': 'Hardy', 'lastName': 'Tom', 'age': '56'}
*/
conn.insert(tableName, data, function(insertResponse) {
    // insertResponse is the object with insertId, number of errors, number of warnings etc.
    console.log(insertResponse);
})

conn.exec_raw_query(sqlRawQuery, function(result) {
    console.log(result);
});

conn.exec_transaction(trans, function(result) {     // trans is array of raw queries for transaction
    console.log(result);
});