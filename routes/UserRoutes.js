"use strict";
const express = require('express');
const router = express.Router();

const { register } = require("../controllers/UserController.js");


router.post("/user", register);

module.exports = router;