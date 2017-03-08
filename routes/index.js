var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/kb';
var cookieParser = require('cookie-parser');
var Promise = require('bluebird');


router.use(cookieParser());

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.cookies.login){
        res.render('index');
    }
    else{
        res.render('home');
    }
});

router.get('/audit', function(req, res, next){
    if(req.cookies.login){
        res.render('audit');
    }
    else{
        res.render('home');
    }
});

router.get('/FAQ', function(req, res, next){
    if(req.cookies.login){
        res.render('FAQ');
    }
    else{
        res.render('home');
    }
});

router.get('/stats', function(req, res, next){
    if(req.cookies.login){
        res.render('stats');
    }
    else{
        res.render('home');
    }
})


/**
 * Method is no longer used. We now send almost all of the information straight to the client since its not very much data
 */

function getNextDoc(res, callback){
    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        var cursor = db.collection('review').find( {"login" : null}).sort({"title": 1});
        cursor.count().then(function(count){
            console.log(count);
            //res.render('index', {pendingReview: count});

            //item = cursor.limit(1).toArray();
            cursor.next(function(err, item){
                if(item != null) {


                    var pendingReview = count,
                        docTitle = item.title,
                        currentGroup = item.group,
                        commentsTopics = item.comments.topics,
                        commentsOwnership = item.comments.ownership,
                        owner = item.owner,
                        docId = item.docId,
                        previusLogin = item.login,
                        id = item._id;

                    var nextDoc = {
                        pendingReview: pendingReview,
                        docTitle: docTitle,
                        currentGroup: currentGroup,
                        commentsTopics: commentsTopics,
                        commentsOwnership: commentsOwnership,
                        owner: owner,
                        docId: docId,
                        previousLogin: previusLogin,
                        id: id
                    };
                    db.close();
                    res.send(nextDoc);
                    //callback();
                }
                else {
                    db.close();
                }
            });

        });
    });
}

/**
 * Method is no longer used, we now pull most of the data in the inital load and only write to the database in subsequent server client connections
 */
router.get('/get', function(req, res, next){
    getNextDoc(res);
});

router.post('/write', function(req, res, next){
    var owner;
    if(req.body.owner){
        owner = req.body.owner;
    }
    else {
        owner = req.cookies.owner;
    }
    console.log(req.body);
    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('review').findOneAndUpdate(
            {docId: parseInt(req.body.docId)},
            {$set:
                { "suggestedGroup": req.body.group,
                    "comments": {
                        "topics" : req.body.commentsTopic,
                        "ownership" : req.body.commentsOwnership
                    },
                    "login" : req.cookies.login,
                    "stamp" : getTime(),
                    "important" : req.body.important
                }
            }, 
            function(err, result){
                if(err) throw err;
                res.sendStatus(200);
                console.log(result);
        });
    });
});

router.post('/login', function(req, res, next){

    if(''.valueOf() == req.body.password.valueOf()){
        login = req.body.login;
        res.cookie('login', login);
        res.send();
    }
    else{
        res.render('login');
    }

});

/**
 * Method is no longer used, owners are not relevant currently
 */

router.get('/getOwners', function(req, res){

    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('owners').find().toArray(function(err, data){
            res.send(data);
        });
        //res.send(ownersInGroup);
        //console.log(ownersInGroup);
    });
});

router.get('/groups', function(req, res){
    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('groups').find().toArray(function(err,data){
            res.send(data);
        });
    });
});

/**
 * Method is not currently used, we have scrapped all of the groups
 */

router.post('/addGroup', function(req, res){
    var group = req.body.group;

    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('groups').insertOne({"group" : group}, function(){
            res.sendStatus(200);
        });
    })
});

router.get('/todoDocs', function(req, res){
    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('review').find( {"login" : null}).limit(100).sort({"title": 1}).toArray(function(err, data){
            if (err) console.log(err);
            res.send(data);
        });
    });
});

router.get('/doneDocs', function(req, res){
    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('review').find({"login" : {$ne :null}})
            .sort({"title" : 1}).toArray(function(err, data){
                if (err) console.log(err);
                res.send(data);
        });
    });
});

router.get('/getEverything', function(req, res){
    MongoClient.connect(url, function(err, db){
        db.collection('review').find().sort({"title": 1}).toArray(function(err, db){
            if (err) console.log(err);
            res.send(db);
        });
    });
});

//doing our best to avoid callback hell

router.get('/chartData', function(req, res){
    outData = [];
    MongoClient.connect(url, function(err, db){
        //assert(null, err);
        db.collection('review').find().count().then(function(count){
            outData["all"] = count;
            db.collection('review').find({"login" : null}).count().then(function(count){
                outData["todo"] = count;
                db.collection('review').find({"important" : false}).count().then(function(count){
                    outData["flagged"] = count;
                    db.collection('review').find({"login": {$ne: null}}).count().then(function(count){
                        outData["reviewed"] = count;
                        lastOut = JSON.stringify(outData);
                        console.log(lastOut);
                        res.send(lastOut);
                    });
                });
            });
        });
        

    })
});
/*
Date is given in Hourminutessecondsdaymonth
 */

function getTime(){
    var d = new Date();
    var h = addZero(d.getHours());
    var m = addZero(d.getMinutes());
    var s = addZero(d.getSeconds());
    var day = addZero(d.getDate());
    var month = addZero(d.getMonth());
    return ""+h+m+s+day+month;
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

module.exports = router;
