const Story = require('../models/story');

// メインページのレンダリング
exports.getIndex = (req, res, next) => {
	res.render('bot/index', {
		path: '/bot',
		// userName: req.user.name,
		pageTitle: 'ChatBot',
		isAuthenticated: req.session.isLoggedIn
	});
};

//テキストの内容をオウム返しする
exports.repeatBot = (req, res, next) => {
	let repeat = `「${req.body.text}」ですね！`;
	let data = {
		"output": [
			{
				"resType": "text",
				"delay": 500,
				"content": repeat
			}
		]
	};
	res.send(data.output[0]);
};

// ルールベースの応答をする
// JSON形式でデータを返す
exports.storyBot = (req, res, next) => {
	let progress = req.body.progress;
	let context = req.body.context;
	let userName = req.user.name;
	console.log(progress, context);

	Story.findById("5d9b20587c213e55613b1693")
		.then(stories => {
			// fetchしたストーリーが終わったら、終了する内容を返す
			if (progress < stories.output.length) {
				story = stories.output[progress];
				return Story.convertKeyword(story, userName);
			} else {
				let content = `今日はここまでにしましょう！お疲れ様でした！`;
				let data = {
					"output": [
						{
							"resType": "text",
							"delay": 500,
							"content": content,
							"stop": true
						}
					]
				};
				res.send(data.output[0]);
			}
		})
		.then(story => {
			console.log({ story });
			res.send(JSON.stringify(story));
		})
		.catch(err => {
			console.log(err);
		});
}
