module.exports =  function() {
   //security experts, please feel free to cringe
   var fjfjfj=[32,523,435,21,2436,36,234,5243,346,34,542,5,24,5243,6256,456,24,65,464,
   65,465,56,56,546,542,6,565,46,654,6,5645,654,64,87,8790,3,571,7548,760,36,87356,76,
   57235,9838,625,645,76587,65338,56387,65,47,658,65,53,5,3,52,5,35,436,76,98,5,975,6,
   34,435,1,0,7,65,4,80,644,5,7,9,6,44,6,8,7,544,5,7,88,456,6,54,5,77,45624,456,6,56,
   34,435,1,0,7,65,4,830,644,5,7,9,6,44,6,8,5,544,5,7,88,456,6,54,5,77,45624,456,6,5];
   var fs = require('fs');
   var ObjectID = require('mongodb').ObjectID;
    function Database(address,dbname,callback) {
        
        var self=this;
        
        self.mongo = require('mongodb').MongoClient;

        // Connect to the db (localhost:27017/exampleDb)
        self.mongo.connect(address, function(err,cl) {
          if(!err) {
            //self.db=db;
            self.db=cl.db(dbname);

            //Connect to all the collections
            self.db.collection('status2', function(err, collection) {
                if(!err) {
                    self.statusCollection=collection;
                    callback(self);
                } else {
                    console.log('ERROR: conencting to MongoDB colection [status]: '+err);
                }
            });
	   } else {
            console.log('Error connecting to mongo: '+err)
           }
        });
    }



    Database.prototype.updateStatus = function (statusInfo,callback)  {
        this.statusCollection.update({name:statusInfo.name},statusInfo, {upsert:1, w:1}, callback);
    }
    Database.prototype.clearStatus = function (callback)  {
        this.statusCollection.remove({})
    }
    Database.prototype.findStatus = function (name,callback) {
        var self=this;
        self.statusCollection.findOne({name:name}, function(err, item) {
            callback(err,item);
        });
    }

    Database.prototype.allStatus = function(callback) {
        var self=this;
        ret = []
        var cursor = self.statusCollection.find({});
        cursor.each(function(err, doc) {
            if (err) {
                callback(err,null)
            } else if (doc != null) {
                ret.push(doc)
            } else {
                callback(err,ret)
            }
        });
    }


    return Database;
}
