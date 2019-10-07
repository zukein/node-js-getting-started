// フロントサイドで、ルールベースbotの進行を制御するためのグローバル変数
let progress = 0;      // postでサーバーに送信する
let context = 'intro'; // フロントサイドで処理を分岐させる

/**
 * リクエストに必要なパラメータを設定
 */
const setParameter = () => {
	let url = "http://localhost:3001/bot/story";

	let data = {
		"progress": progress,
		"context": context
	}; //会話の進捗を送信する。
	requestServer(url, 'post', 'json', data); // requestServer('url','get or post','dataType', 'postData')
}

// 会話の進捗を初期化する
const initProgress = () => {
	progress = 0;
	console.log('initialize progress done!')
}

/**
 * ボタンのname(またはinputのvalue)の内容をオウム返しするレスポンスをリクエスト
 * POST /repeat
 * @param {object} e
 */
const postRepeat = (e) => {
	let url;
	let data;
	console.log(e.target);
	if (e.target.name === 'feeling') {
		url = "http://localhost:3001/bot/repeat";
		data = {
			"text": e.target.value
		};

		// ToDo: MongoDBにユーザー情報を登録する
		// ToDo: classNameの分岐処理をnameで実行するように変更する
		// inputのvalueを配列に格納
	} else if (e.target.className === 'inputBtn') {
		url = "http://localhost:3001/bot/repeat";
		let inputData = $('.inputText').val();
		data = {
			"text": inputData
		};

	}
	requestServer(url, 'post', 'json', data);
}


/**
 * 引数のパラメータに基づいて、サーバーにリクエストを実行
 * @param {string} url
 * @param {string} type
 * @param {string} dataType
 * @param {object} data
 */
const requestServer = (url, type, dataType, data) => {

	$("#btn_bot").prop("disabled", true);
	$("#btn_next").prop("disabled", false);

	// 引数チェック
	// console.log({ url });
	// console.log({ type });
	// console.log({ dataType });
	// console.log({ data });

	//読み込みが完了したときに実行される関数を定義
	$.ajax({
		type: type,
		url: url,
		dataType: dataType,
		data: data
	})
		.done(data => {
			console.log('success', data);
			resetContent();
			let delayMs = 500;// デフォルトで500msに設定
			if (data.delay) {
				delayMs += data.delay;
			}

			let promise = Promise.resolve();
			promise
				// .then(wait_msec(delayMs))
				.then(() => { renderMsg(data); })
				// .then(wait_msec(delayMs))
				.then(() => {
					// Todo: 離脱の処理を書き換える
					if (data.stop) {
						return
					};
					showArrow();
				})
				// .then(wait_msec(delayMs))
				.then(() => {
					if (data.option) {
						if (data.option.type === 'feeling') {
							selectExecutionCb(answerFeeling);
						} else if (data.option.type === 'quickRes') {
							quickRes(data.option.select);
						} else if (data.option.type === 'selectMenu') {
							selectMenu(data.option.select);
						} else if (data.option.type === 'inputText') {
							inputText();
						}
					} else {
						// Todo: 離脱の処理を書き換える
						if (data.stop) {
							return
						};
						showNext();
					}
					console.log({ data });
				})
				.catch(err => console.log(err));

		}).fail(err => {
			console.log('failure', err);
		})
}

/**
 * 引数の時間だけpromiseチェーンの関数実行を遅延する関数
 * @param {number} timeout
 * @returns {function} resoleve()を実行するプロミス関数
 */
const wait_msec = (timeout) => {
	return function () {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve();
			}, timeout);
		});
	};
};

/**
 * レスポンスで受け取ったjsonデータに応じて、動的にDOMを操作する関数
 * @param {object} data
 */
const renderMsg = (data) => {
	console.log({ data });
	let msg = $('<div>').attr({
		class: 'msg'
	});

	let p = $('<p>').attr({
		id: 'txt'
	});
	p.text(data.content);
	msg.append(p);

	if (data.resType === 'image') {
		let div = $('<div>').attr({
			class: 'monitor__content'
		});

		let img = $('<img>').attr({
			id: 'pic',
			src: data.path
		})

		div.append(img);
		$('.monitor').append(div);
	} else if (data.resType === 'video') {
		let div = $('<div>').attr({
			class: 'monitor__content'
		});

		let mov = $('<video>').attr({
			id: 'mov',
			src: data.path,
			autoplay: true,
			controls: true
		})

		div.append(mov);
		$('.monitor').append(div);
	}
	$('.msg-container').append(msg);
}

// 新しくDOM要素を生成する前に、すでに存在するDOM要素を削除する。
const resetContent = () => {
	$('.monitor__content').remove();
	$('.msg').remove();
}

/**
 * 気分について回答するボタンを生成する関数
 * <div class="msg__action">
 *  <input class="feeling btn btn-outline-info" type="button" name="{string}" value="{string}">
 *  ...
 * </div>
 */
const answerFeeling = () => {

	let msg = $('<div>').attr({
		class: 'msg'
	});
	let p = $('<p>').attr({
		id: 'txt'
	});
	p.text("今の気分はどうですか?");
	msg.append(p);

	let div = $('<div>').attr({
		class: 'msg__action'
	});

	let feelings = [
		{ label: '恐怖\u{1f628}' },
		{ label: '不安\u{1f61f}' },
		{ label: '落ち込み\u{1f61e}' },
		{ label: '怒り\u{1f621}' },
		{ label: '悲しみ\u{1f622}' },
		{ label: '喜び\u{1f60a}' },
		{ label: 'その他\u{1f914}' }
	]

	for (let i = 0; i < feelings.length; i++) {
		let btn = $('<input>').attr({
			class: 'feeling btn btn-outline-info',
			type: 'button',
			name: 'feeling',
			value: feelings[i].label
		});
		div.append(btn);
	}
	// $('.msg').append(div);
	msg.append(div);
	$('.msg-container').append(msg);
	$('.feeling').on('click', postRepeat);
}

/**
 * クイックレスポンスの実装
 * レスポンスで受け取ったjsonデータに
 * "option": "quickRes"
 * が含まれる場合、
 * "select": "res"の内容に応じて、動的にDOMを操作する関数
 * 
 * 気分について回答するボタンを生成する関数
 * <div class="msg__action centering-L">
 *  <input class="respons btn btn-outline-info" type="button" name="{string}" data-step="{string}">
 *  ...
 *  (data-step="0"の場合)
 *  <input class="respons" type="button" name="{string}">
 * </div>
 * @param {array} select
 */
const quickRes = (select) => {
	let div = $('<div>').attr({
		class: 'msg__action'
	});
	$(div).addClass('centering-L');

	for (let i = 0; i < select.length; i++) {
		let btn = $('<input>').attr({
			'class': 'respons btn btn-outline-info',
			'type': 'button',
			'value': select[i].res,
			'data-step': select[i].step
		});

		div.append(btn);
	}
	$('.msg').append(div);
	$('.respons').on('click', (e) => {

		if (!e.target.dataset.step) {
			progress++;
		} else {
			progress = e.target.dataset.step;
		}

		console.log({ progress });
		setParameter();
	});
}

/**
 * メニュー表示の実装
 * レスポンスで受け取ったjsonデータに
 * "option": "selectMenu"
 * が含まれる場合、
 * "select": "menu"の内容に応じて、動的にDOMを操作する関数
 * 
 * <div class="msg__action centering-L">
 *  <input class="menu btn btn-outline-info" type="button" valu="{string}" data-init="{boolean}">
 *  ...
 * </div>
 * @param {array} select
 */
const selectMenu = (select) => {
	let div = $('<div>').attr({
		class: 'msg__action'
	});
	$(div).addClass('centering-L');

	for (let i = 0; i < select.length; i++) {
		let btn = $('<input>').attr({
			'class': 'menu btn btn-outline-info',
			'type': 'button',
			'value': select[i].menu,
			'data-init': (select[i].init) ? 'true' : 'false'
		});
		div.append(btn);
	}

	$('.msg').append(div);
	$('.menu').on('click', (e) => {

		console.log(e.target.value);

		//進捗初期化メニューなら、進捗をリセットする
		if (e.target.dataset.init) {
			initProgress();
		}

		if (e.target.value === "気持ちの記録") {
			resetContent();
			answerFeeling();
		} else if (e.target.value === "こころをともす") {
			context = 'story';
			setParameter();
		}
	});
}

/**
 * コールバック関数を実行するかどうを
 * "はい"か"いいえ"で選択するためのボタンを生成する関数
 * Yes=>cb実行, No=>シナリオに戻る
 * 
 * <div class="msg__action centering-L">
 *  <input class="two_choices btn btn-outline-info" type="button" valu="はい">
 *  <input class="two_choices btn btn-outline-info" type="button" valu="いいえ">
 * </div>
 * @param {function} cb
 */
const selectExecutionCb = (cb) => {
	let div = $('<div>').attr({
		class: 'msg__action'
	});
	$(div).addClass('centering-L');

	for (let i = 0; i < 2; i++) {
		let btn = $('<input>').attr({
			'class': 'two_choices btn btn-outline-info',
			'type': 'button',
			'value': (i == 0) ? 'はい' : 'いいえ'
		});
		div.append(btn);
		$('.msg').append(div);
	}

	$('.two_choices').on('click', (e) => {

		console.log(e.target.value);

		if (e.target.value === "はい") {
			resetContent();
			cb();
			// answerFeeling();
		} else if (e.target.value === "いいえ") {
			progress++;
			setParameter();
		}
	});
}

/**
 * テキスト入力フォームの表示
 * <div class="centering-L">
 *  <input class="inputText">
 *  <input class="inputBtn btn btn-primary" type="button" value="送信">
 * </div>
 */
const inputText = () => {
	let div = $('<div>').attr({
		class: 'centering-L'
	});

	let inputText = $('<input>').attr({
		class: 'inputText'
	});

	let inputBtn = $('<input>').attr({
		'class': 'inputBtn btn btn-primary',
		'type': 'button',
		'value': '送信'
	});

	$(div).append(inputText);
	$(div).append(inputBtn);
	$('.msg').append(div);
	$('.inputBtn').on('click', postRepeat);
}

/**
 * ユーザーに対して、次に進めることを示すための矢印アイコンを表示
 * <div class="arrow blinking">
 *  ::before
 * </div>
 */
const showArrow = () => {
	let div = $('<div>').attr({
		class: 'centering'
	});

	let arrow = $('<div>').attr({
		class: 'arrow'
	});
	$(arrow).addClass('blinking');

	$(div).append(arrow);
	$('.msg').append(div);
}

/**
 * 次に進むボタンを表示
 * <div class="centering-L">
 *  <input class="next btn btn-primary" type="button" value="次へ">
 * </div>
 */
const showNext = () => {
	let div = $('<div>').attr({
		class: 'centering-L'
	});

	let btn = $('<input>').attr({
		'class': 'next btn btn-primary',
		'type': 'button',
		'value': '次へ',
	});

	div.append(btn);
	$('.msg').append(div);

	$('.next').on('click', () => {
		progress++;
		console.log({ progress });
		setParameter();
	});
}

// $("#btn_next").prop("disabled", true);
$('#btn_start').on('click', () => {
	console.log('start')
	setParameter();
});
$('#btn_next').on('click', () => {
	progress++;
	console.log({ progress });
	setParameter();
});

// レンダリング時に実行したい関数を指定
window.onload = () => {
	setParameter();
}