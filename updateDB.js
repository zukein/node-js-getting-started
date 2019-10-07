const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

/** 接続URL */
const url = 'mongodb://localhost:27017';

/** DB名 */
const dbName = 'LightUP';


/** ./data/のjsonFileSyncを読み込んで、戻り値を返す */
const readJson = () => {
	const pathStory = path.join(
		path.dirname(process.mainModule.filename),
		'data', 'chapter-1.json'
	);

	return JSON.parse(fs.readFileSync(pathStory));
}

/** Create */
const insertDocuments = (db, data) => {
	/** collectionを取得 */
	const collection = db.collection('stories');

	/** collectionにdocumentを追加 */
	collection.insertOne(
		data,
		(err, result) => {
			// アサーションテスト
			assert.equal(err, null);
			// assert.equal(3, result.result.n);
			// assert.equal(3, result.ops.length);
			/** 成功した旨をコンソールに出力 */
			console.log('Inserted 3 documents into the collection');
		},
	);
}

/** Read */
const findDocuments = (db) => {
	/** collectionを取得 */
	const collection = db.collection('myCollection');
	/** documentを検索（ageが20以上のdocumentのnameを取得） */
	collection
		.find({})
		.project({ name: 1 })
		.toArray((err, docs) => {
			// アサーションテスト
			assert.equal(err, null);
			/** 成功した旨をコンソールに出力 */
			console.log('Found the following records');
			/** 検索結果をコンソールに出力 */
			console.log(docs);
		});
}

/** Update */
const updateDocument = (db) => {
	/** collectionを取得 */
	const collection = db.collection('myCollection');
	/** documentを更新（ageが19以下のdocumentに{ status: false }を追加） */
	collection.updateMany({ age: { $lt: 20 } }, { $set: { status: false } }, (err, result) => {
		// アサーションテスト
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		/** 成功した旨をコンソールに出力 */
		console.log('Updated the document with the field a equal to 2');
	});
}

/** Delete */
const removeDocument = (db) => {
	/** collectionを取得 */
	const collection = db.collection('myCollection');
	/** documentを削除（statusがfalseのdocuentを削除） */
	collection.deleteMany({ status: false }, (err, result) => {
		// アサーションテスト
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		/** 成功した旨をコンソールに出力 */
		console.log('Removed the document with the field a equal to 3');
	});
}

/** 即時関数をasync functionとして定義 */
const mongoTest = async () => {
	let client;

	try {
		/** DBサーバに接続 */
		client = await MongoClient.connect(
			url,
			{ useNewUrlParser: true, useUnifiedTopology: true },
		);
		/** DBを取得 */
		const db = client.db(dbName);

		// jsonを読み込む
		let data = await readJson();
		console.log(data);

		/** CRUDを行う関数をawitで待機させる */
		await insertDocuments(db, data); // Create
		// await updateDocument(db); // Update
		// await findDocuments(db); // Read
		// await removeDocument(db); // Delete
		// await findDocuments(db); // Read
	} catch (err) {
		/** DBサーバ接続に失敗した時の処理 */
		console.log(err.stack);
	}

	/** DBサーバとの接続解除 */
	client.close();
};

mongoTest();

