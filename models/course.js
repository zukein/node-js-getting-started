"use strict";

const mongoose = require("mongoose"),
  { Schema } = require("mongoose");

var courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    point: {
      type: Number,
      default: 0,
      min: [0, "負の値は設定できません"]
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, "負の値は設定できません"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Course", courseSchema);
