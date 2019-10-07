"use strict";

const router = require("express").Router(),
  authRoutes = require("./authRoutes"),
  botRoutes = require("./botRoutes"),
  userRoutes = require("./userRoutes"),
  subscriberRoutes = require("./subscriberRoutes"),
  courseRoutes = require("./courseRoutes"),
  errorRoutes = require("./errorRoutes"),
  homeRoutes = require("./homeRoutes"),
  apiRoutes = require("./apiRoutes");

router.use("/api", apiRoutes);
router.use("/auth", authRoutes);
router.use("/bot", botRoutes);
router.use("/users", userRoutes);
router.use("/subscribers", subscriberRoutes);
router.use("/courses", courseRoutes);
router.use("/exposure", homeRoutes);
router.use("/", errorRoutes);

module.exports = router;
