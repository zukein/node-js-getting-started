"use strict";

module.exports = {
  index: (req, res) => {
    res.render("exposure/index", {
      path: '/exposure',
      pageTitle: 'Exposure'
    });
  },
  chat: (req, res) => {
    res.render("chat");
  }
};
