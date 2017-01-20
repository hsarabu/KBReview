var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/kb';
var cookieParser = require('cookie-parser');
var Promise = require('bluebird')

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
        db.collection('review').findOneAndUpdate({docId: parseInt(req.body.docId)},
            {$set:
                { "suggestedGroup": req.body.group,
                    "comments": {
                        "topics" : req.body.commentsTopic,
                        "ownership" : req.body.commentsOwnership
                    },
                    "login" : req.cookies.login,
                    "stamp" : getTime()
                }
        }, function(err, result){
            if(err) throw err;
            console.log(result);
        });
    getNextDoc(res);
    });
});

router.post('/login', function(req, res, next){

    if('supp0rt'.valueOf() == req.body.password.valueOf()){
        login = req.body.login;
        res.cookie('login', login);
        res.send();
    }
    else{
        res.render('login');
    }

});

/*router.post('/getOwners', function(req, res){
    var group = req.body.group;

    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('owners').find({"group" : group}).toArray(function(err, data){
            res.send(data);
        });
        //res.send(ownersInGroup);
        //console.log(ownersInGroup);
    });
});*/

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

router.post('/addGroup', function(req, res){
    var group = req.body.group;

    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        db.collection('groups').insertOne({"group" : group}, function(){
            res.sendStatus(200);
        });
    })
});

/*
router.get('/groups', function(req, res, next){
    var groups = [];
    MongoClient.connect(url, function(err, db){
        assert.equal(null, err);
        var cursor = db.collection('owners').find()
        /*
        cursor.forEach(function(item){
            group = item.group;
            groups.push(group)
        }, function(err){
            db.close();
            throw err;
        });
        
        cursor.toArray(function(allGroups){
            res.send(allGroups);
        })

    });

});
*/

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
