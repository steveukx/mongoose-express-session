
# Mongoose Store

A simple [http://www.senchalabs.org/connect/session.html#exports.Store](Store) implementation using
[http://mongoosejs.com/](mongoose) to persist to a [https://www.mongodb.org/](mongodb) data store.

# Usage

    var Store = require('express-session').Store;
    var MongooseStore = require('mongoose-express-session')(Store);
    
    app.use(require('express-session')({
        secret: 'keyboard cat',
        resave: false,
        rolling: false,
        saveUninitialized: true,
        store: new MongooseStore({
            /* configuration */
        })
    }));

The `configuration` properties require one of:

* `connection` as an already connected mongoose instance:

````
    var mongoose = require('mongoose');
    mongoose.connect('http://server/db');
    new MongooseStore({connection: mongoose});
````

* `mongoose` instance and a `connection` string

````
    var mongoose = require('mongoose');
    new MongooseStore({connection: 'http://server/sessions', mongoose: mongoose});
````

* `mongoose` as an already connected mongoose instance without the `connection` string

````
    var mongoose = require('mongoose');
    mongoose.connect('http://server/db');
    new MongooseStore({mongoose: mongoose});
````

When just supplying mongoose, the default connection string `mongodb://localhost/connect-sessions` will be used,
allowing for connecting the session model without impacting the application database.

* `store` instead of passing the Store constructor up-front, it can also be passed into the configuration

````
    var MongooseStore = require('mongoose-express-session')();
    var mongooseStore = new MongooseStore({
        mongoose: mongoose,
        store: require('express-session').Store
    });
````

# Project Status

Currently a work in progress and not production-ready.

