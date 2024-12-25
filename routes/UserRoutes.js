"use strict";
const express = require('express');
const router = express.Router();

const { register } = require("../controllers/UserController.js");
const { ExistsUser } = require('../middlewares/ExistsUser.js');
const { AuthMiddleware } = require('../middlewares/AuthMiddleware.js');

router.post("/user", AuthMiddleware, ExistsUser, register);

module.exports = router;