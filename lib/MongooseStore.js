(function () {

    'use strict';

    function MongooseStore (options) {
        var mongoose, connection;

        // use default options if none given
        if (!options) options = MongooseStore.defaultOptions;

        // use a connection string or a reference to an outer connection
        if (!options.connection) throw "Connection string or reference required";
        if (typeof options.connection === "string") {
            mongoose = options.mongoose;
            connection = mongoose.createConnection(options.connection);
        }
        else {
            connection = mongoose = options.connection;
        }

        var Schema = mongoose.Schema;
        var Session = new Schema({
            id: {
                type: String,
                index: {
                    unique: true
                }
            },
            expiry: {
                type: Date,
                default: Date.now,
                index: {
                    expires: options.sessionLifespan || MongooseStore.defaultOptions.sessionLifespan
                }
            },
            data: {
                type: String
            }
        });
        var Model = connection.model(options.modelName || MongooseStore.defaultOptions.modelName, Session);

        var Store = new(options.superclass || MongooseStore.defaultOptions.superclass);

        var createOrUpdate = function (type, id, data, onDone) {
            var json = JSON.stringify(data);
            Model.findOneAndUpdate({id: id}, {expiry: Date.now(), data: json}, {upsert: true}, function (err, update) {
                onDone(err);
            })
        };

        Store.get = function (id, onDone) {
            Model.findOne({id: id}, function (err, session) {
                onDone(err, !err && session ? JSON.parse(session.data) : null);
            })
        };

        Store.set = function (id, data, onDone) {
            createOrUpdate('set', id, data, onDone);
        };

        Store.touch = function (id, data, onDone) {
            createOrUpdate('touch', id, data, onDone);
        };

        Store.destroy = function (id, onDone) {
            Model.findOneAndRemove({id: id}, function (a, b, c) {
                onDone(null);
            });
        };

        return Store;
    }

    MongooseStore.defaultOptions = {
        connection: 'mongodb://localhost/connect-sessions',
        sessionLifespan: 60 * 20,
        modelName: 'Session',
        superclass: require('events').EventEmitter
    };

    module.exports = function (Store) {

        return function (options) {
            options = options || {};
            options.connection = options.connection || MongooseStore.defaultOptions.connection;
            options.superclass = options.superclass || options.store || Store;

            return new MongooseStore(options);
        }
    };

}());
