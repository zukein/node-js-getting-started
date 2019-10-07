var express = require('express');
var router = express.Router();

const botController = require('../controllers/botController');

/* GET users listing. */
router.get('/', botController.getIndex);

// オウム返しで返答する
router.post('/repeat', botController.repeatBot);

// ルールベースで応答する
router.post('/story', botController.storyBot);

module.exports = router;
