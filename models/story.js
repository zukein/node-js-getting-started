const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema(
  {
    output: [{
      resType: {
        type: String,
        required: true
      },
      delay: String,
      content: String,
      option: {
      }
    }]
  }
);

/**
* "@keyword"を第2引数の文字列に変換して返す関数
* @param {object} data
* @param {string} name
* @returns {string} 変換後の文字列
*/
storySchema.statics.convertKeyword = function (data, name) {
  let regex = /@user_name/g;
  data.content = data.content.replace(regex, name);
  return data;
}

module.exports = mongoose.model('Story', storySchema);