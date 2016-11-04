var assert = require('assert');
var YP = require('./yunpian');
var yunpian;

/**
 * Export the YunPianConnector class.
 */

module.exports = YunPianConnector;

/**
 * Create an instance of the connector with the given `settings`.
 */

function YunPianConnector(settings) {
    assert(typeof settings === 'object', 'cannot initialize YunPianConnector without a settings object');
    var connector = this;

    var apiKey = this.apiKey = settings.apiKey;

    yunpian = connector.yunpian = new YP(apiKey);
}

YunPianConnector.initialize = function (dataSource, callback) {
    dataSource.connector = new YunPianConnector(dataSource.settings);
    callback();
}

YunPianConnector.prototype.DataAccessObject = YunPian;

function YunPian() {}

/**
 * Send a YunPian message or call with the given `options`.
 */
YunPian.send = function (options, fn) {
    var dataSource = this.dataSource;
    var settings = dataSource && dataSource.settings;
    var connector = dataSource.connector;
    assert(connector, 'Cannot use this module without a connector!');

    var mobile = '';
    if (options.to && typeof (options.to) === 'string')
        mobile = options.to;
    else if (options.to && typeof (options.to) === 'Array')
        mobile = options.to.join(',');

    connector.yunpian.send({
        mobile: mobile,
        text: options.content
    }, function (err, result) {
        try {
            result = JSON.parse(result);
            if (err) {
                fn(err);
            } else if (result.code !== 0) {
                fn(new Error(result.msg||result.detail));
            } else {
                fn(null, result);
            }
        } catch (ex) {
            fn(ex);
        }
    });
}

/**
 * Initialize the connector for the given data source
 * @param {DataSource} dataSource The data source instance
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, callback) {};

/**
 * Send using `modelInstance.send()`.
 */

YunPian.prototype.send = function (fn) {
    this.constructor.send(this, fn);
}

/**
 * Access the yunpian client object.
 */

YunPianConnector.client = YunPianConnector.prototype.client = YunPian.client = YunPian.prototype.client = yunpian;