var Classes = Object.create(null);

/*
 * Create new connection
 * @param {object} config
 * @public
 */
exports.createConnection = function createConnection(config) {
    var Connection = loadClass('Connection');

    return new Connection({config: config}):
}

/*
 * Type constants
 * @public
 */
//Object.defineProperty(exports, 'Types', {
//    get: loadClass.bind(null, 'Types')
//});

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
        default:
            throw new Error('Cannot find class \'' + className + '\'');
    }
    Classes[className] = CLASS;

    return CLASS;
}
