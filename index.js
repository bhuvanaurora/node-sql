var Classes = Object.create(null);

/*
 * Create new connection
 * @param {object} config
 * @public
 */
exports.createConnection = function createConnection(config) {
    var Connection = loadClass('Connection');

    return new Connection({config: config});
}

exports.Schema = function Schema(schemaObject) {
    var Schema = loadClass('Schema');

    return new Schema(schemaObject);
}

/*
 * Schema
 * @public
 */
// Object.defineProperty(exports, 'Schema', {
//     get: loadClass.bind(null, 'Schema')
// });

/*
 * Load the given class
 * @private
 */
function loadClass(className) {
    var CLASS = Classes[className];

    if(CLASS !== undefined) return CLASS;

    switch(className) {
        case 'Connection':
            CLASS = require('./lib/Connection');
            break;
        case 'Schema':
            CLASS = require('./lib/Schema');
            break;
        default:
            throw new Error('Cannot find class \'' + className + '\'');
    }
    Classes[className] = CLASS;

    return CLASS;
}
