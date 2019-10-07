const mongoose = require('mongoose');
const Schema = mongoose.Schema;
Subscriber = require("./subscriber");

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		zipCode: {
			type: Number,
			min: [1, "不正な値"],
			max: 99999
		},
		subscribedAccount: {
			type: Schema.Types.ObjectId, ref: "Subscriber"
		},
		courses: [{
			type: Schema.Types.ObjectId, ref: "Course"
		}]
	},
	{
		timestamps: true
	}
);

userSchema.pre("save", function (next) {
	let user = this;
	if (user.subscribedAccount === undefined) {
		Subscriber.findOne({
			email: user.email
		})
			.then(subscriber => {
				user.subscribedAccount = subscriber;
				next();
			})
			.catch(error => {
				console.log(`Error in connecting subscriber: ${error.message}`);
				next(error);
			});
	} else {
		next();
	}
});

module.exports = mongoose.model('User', userSchema);

