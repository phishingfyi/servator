import express from "express";
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.set('Content-Type', 'text/plain');
    res.send('phishing.fyi: Coming soon!');
});

export default router;