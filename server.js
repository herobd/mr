#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');

var redirsFile =  process.env.HOME +'/redirs.json';
var senseiFile =  process.env.HOME +'/sensei.json';
var sourceCounterFile =  process.env.HOME +'/sourceCounter.json';

var Database = require('./database')();
var mongolab = 'heroku_vhwr6c7j:qbm5rn0ibpqkjamponccqpatil@ds233167.mlab.com:33167/heroku_vhwr6c7j'
var dbname = 'heroku_vhwr6c7j'
//console.log(process.env)
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;
    
    self.redirs={"none":"none"};
    self.sourceCounter={};
    self.sensei_status={}
    self.lastChecked=Date.now()
    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = '0.0.0.0';//process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.PORT;//process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'xx.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
        self.zcache['projects.html'] = fs.readFileSync('./projects.html');
        
        //self.zcache['game/assests/Monster Growl-SoundBible.com-344645592.mp3'] = fs.readFileSync('./public/game/assests/Monster Growl-SoundBible.com-344645592.mp3');
        //self.zcache['game/assests/Zombie Moan-SoundBible.com-565291980.wav#t=0.1']=fs.readFileSync('./public/game/assests/Zombie Moan-SoundBible.com-565291980.wav#t=0.1');
        //self.zcache['game/assests/Japanese Temple Bell Small-SoundBible.com-113624364.mp3']=fs.readFileSync('./public/game/assests/Japanese Temple Bell Small-SoundBible.com-113624364.mp3');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            //self.get_saved(function(item){
            self.database.allStatus( function(err,items) {
                //self.sensei_status=item; 
                var tosort=items;
                //for (var name in self.sensei_status) {
                //    tosort.push([self.sensei_status[name]['time'],name])
                //}
                tosort.sort(function(a,b){return b['time']-a['time']});
                var ordered_sensei_status=[];
                for (p of tosort) {
                    clas = 'old';
                    if (p['time']>self.lastChecked){
                        clas='new';
                    }
                    ordered_sensei_status.push([ Date(p['time']), p['name'], p['message'],clas])
                }
                //console.log(ordered_sensei_status)
                res.render('sensei', {status:ordered_sensei_status});
                //res.setHeader('Content-Type', 'text/html');
                //res.send(self.cache_get('index.html') );
                self.lastChecked = Date.now();
            });

        };
        self.routes['/projects'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('projects.html') );
        };
        self.routes['/resume'] = function(req, res) {
            res.redirect('https://docs.google.com/document/d/1-4Wi_Y18SXbd5_utuRe-aexs75DaCvOZ1svzULopqiE/edit?usp=sharing');
        };
        self.routes['/pms1stward'] = function(req, res) {
            res.redirect('https://docs.google.com/forms/d/1OjXD_ubMFUtBJROOltXHg6Gx9X5nS1eNssF-089QPCA/viewform');
        };
        
        self.routes['/app'] = function(req, res) {
            res.redirect('http://128.187.81.130:13723');
        };
        self.routes['/cattss'] = function(req, res) {
            res.redirect('http://128.187.81.130:13723');
            if (req.query.source) {
                if (self.sourceCounter.hasOwnProperty(req.query.source)) {
                    if (self.sourceCounter[req.query.source]++ % 2==0) {
                        fs.writeFile(sourceCounterFile, JSON.stringify(self.sourceCounter), function (err) {
                          if (err) {
                            console.log('ERROR saving sourceCounter: '+err);
                          }
                          console.log('sourceCounter saved!');
                        });
                    }
                } else
                    self.sourceCounter[req.query.source]=1;
                console.log(self.sourceCounter);
            }
        };

        self.routes['/sourceCounter'] = function(req,res) {
             if (req.query.clear)
                 self.sourceCounter={};
             var toSend = '<h>Source counter</h><br>';
             for (var source in self.sourceCounter) {
                 if (self.sourceCounter.hasOwnProperty(source)) {
                     toSend += '<br>'+source+': '+self.sourceCounter[source];
                 }
             }
             res.send(toSend);
        }
        
        //66.219.236.172
        
        self.routes['/hidden.jpg'] = function (req, res) {
            if (req.query['secret']=='sexxxy') {
                //res.sendFile('hiddenimage.jpg');
                fs.readFile('hiddenimage.jpg', function(img) {
                    res.writeHead(200, {'Content-Type': 'image/jpeg' });
                    res.end(img, 'binary');
                });
            } else {
                res.send('error');
            }
        };
        
        self.routes['/set/:name'] = function(req, res) {
            var name=req.params.name;
            var url=req.query.url;
		if (url.substr(0,4)!=='http')
                    url='http://'+url;
            self.redirs[name]=url;
            res.redirect(url);
            fs.writeFile(redirsFile, JSON.stringify(self.redirs), function (err) {
              if (err) {
                console.log('ERROR: '+err);
              }
              console.log('redirs saved!');
            });
        };
        self.routes['/sensei-update/:name'] = function(req, res) {
            var name=req.params.name;
            var message=req.query.message;
            //self.sensei_status[name]={'message':message, 'time':Date.now()};
            //res.redirect(url);
            res.setHeader('Content-Type', 'text/plain');
            res.send('ok');
            //console.log(self.sensei_status)
            //self.save(self.sensei_status)
            s = {'name':name, 'message':message, 'time':Date.now()};
            self.database.updateStatus(s,function(err){
                if (err) {
                    self.warn += '['+name+', '+message + ']: '+err+'\n';
                    console.log(err)
                }
            });
        };
        
        self.routes['/s/:name'] = function(req, res) {
            if (req.query.url === undefined)
            {
                if (self.redirs[req.params.name] !== undefined)
                    res.redirect(self.redirs[req.params.name]);
                else
                    res.redirect('/');
            } else {
                var name=req.params.name;
                var url=req.query.url;
		if (url.substr(0,4)!=='http')
                    url='http://'+url;
                self.redirs[name]=url;
                res.redirect(url);
                fs.writeFile(redirsFile, JSON.stringify(self.redirs), function (err) {
                  if (err) {
                    console.log('ERROR: '+err);
                  }
                  console.log('redirs saved!');
                });
            }
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        //self.app = express.createServer();
        self.app = express();
        self.app.set('views', __dirname + '/views');
        self.app.set('view engine', 'ejs');

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
        
        // Static file (images, css, etc)
        self.app.use(express.static('public'));
    };
    //self.get_saved = function(callback) {
    //    self.mongo_client.connect(function(err) {
    //        if (!err) {
    //            //console.log("Connected successfully to server");

    //            const db = self.mongo_client.db(dbname);
    //            db.collection('status', function(err, collection) {
    //                if(!err) {
    //                    collection.findOne({name: 'status'}, function(err, item) {
    //                        //item.update({userId:info.userId, batchId:info.batchId},{$set:info},{w:1}, callback);
    //                        if (!err) {
    //                            self.mongo_client.close();
    //                            if (item!=null){
    //                                callback(item['value'])
    //                            }
    //                            else {callback({})}
    //                        } else {
    //                            console.log('Error findOne '+err)
    //                            callback({})
    //                        }
    //                    });
    //                } else {
    //                    self.mongo_client.close();
    //                    console.log('Error collection ' + err)
    //                }
    //            });
    //        } else {
    //            console.log('Error connect: '+err)
    //        }
    //    });
    //};
    self.get_saved = function(callback) {
        self.mongo_client.connect(function(err) {
            if (!err) {
                //console.log("Connected successfully to server");

                const db = self.mongo_client.db(dbname);
                db.collection('status', function(err, collection) {
                    if(!err) {
                        collection.findOne({name: 'status'}, function(err, item) {
                            //item.update({userId:info.userId, batchId:info.batchId},{$set:info},{w:1}, callback);
                            if (!err) {
                                self.mongo_client.close();
                                if (item!=null){
                                    callback(item['value'])
                                }
                                else {callback({})}
                            } else {
                                console.log('Error findOne '+err)
                                callback({})
                            }
                        });
                    } else {
                        self.mongo_client.close();
                        console.log('Error collection ' + err)
                    }
                });
            } else {
                console.log('Error connect: '+err)
            }
        });
    };
    self.save = function(value) {
        self.mongo_client.connect(function(err) {
            if (!err) {
                //console.log("Connected successfully to server");

                const db = self.mongo_client.db(dbname);

                db.collection('status', function(err, collection) {
                    if(!err) {
                        collection.update({name:'status'},{$set:{name:'status',value:value}},{w:1,upsert:true}, function() {self.mongo_client.close();});
                    } else {
                        self.mongo_client.close();
                        console.log('Error collection ' + err)
                    }
                });
            } else {
                console.log('Error connect: '+err)
            }
        });
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        //self.mongo_client = new MongoClient(mongolab);
        //self.get_saved(function(item){self.sensei_status=item;});

        //test
        //self.save({'test':'tesest'}, function(){self.get_saved(function(item){
        //    console.log('read: ');
        //    for (var nn in item){
        //        console.log(nn + ' : ' +item[nn]);
        //    }
        //})});

        self.database=new Database(mongolab, function(database) {
            console.log('Database connected!');
        });

        
        //saved redir file
        fs.exists(redirsFile, function (exists) {
          if (exists) {
            fs.readFile(redirsFile, function (err, data) {
                if (err) throw err;
                console.log("read redirs file: "+data);
                try {
                    self.redirs=JSON.parse(data);
                } catch(e) {
                    console.log('error reading redir file');
                }
            });
          }
        });
        fs.exists(sourceCounterFile, function (exists) {
          if (exists) {
            fs.readFile(sourceCounterFile, function (err, data) {
                if (err) throw err;
                console.log("read sourceCounter file: "+data);
                try {
                    self.sourceCounter=JSON.parse(data);
                } catch(e) {
                    console.log('error reading sourceCounter file');
                }
            });
          }
        });
        
        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

