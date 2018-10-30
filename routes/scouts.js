var express = require('express');
var router = express.Router();
var Scout = require('../models/Scout');

/* GET users listing. */
router.get('/', function(req, res, next) {
    global.logger.log('debug','Getting all scouts');
    Scout.find({active: true})
        .sort({lastName:-1, firstName: -1})
        .exec(function (err, data) {
            //Something wrong happened!
            if(err) {
               return res.status(500).json({
                   title: 'An error occurred',
                   error: err
               });
            }

            //You have no scout in database yet
            if(!data || data.length <= 0) {
                return res.status(404).json({
                    title: 'No scout in database!',
                    error: {message: 'No scout in database!'}
                });
            }

            //Yeo, all is right!
            res.status(200).json({
                message: 'Success',
                obj: data
            });
        });
});

router.post('/',function (req, res, next) {
    var scout = new Scout({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        birthplace: req.body.birthplace,
        birthcountry: req.body.birthcountry,
        birthday: req.body.birthday,
        address: {
            city: req.body.address.city,
            country: req.body.address.country,
            zipcode: req.body.address.zipcode,
            street: req.body.address.street,
            housenumber: req.body.address.housenumber
        }
    });

    scout.save(function (err, result) {
        if(err){
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }

        res.status(201).json({
            message: 'Scout created',
            obj: result
        });
    });
});
module.exports = router;