const express = require("express");
const productsRepo = require("../../repositories/products");
const productsNewTemplate = require("../../views/admin/products/new");
const { validationResult } = require("express-validator");
const { requireTitle, requirePrice } = require("./validators");

const router = express.Router();

router.get("/admin/products", (req, res) => {});

router.get("/admin/products/new", (req, res) => {
  res.send(productsNewTemplate({}));
});

router.post("/admin/products/new", [requireTitle, requirePrice], (req, res) => {
  const errors = validationResult(req);
  console.log(req.body);
  res.send("submitted");
});

module.exports = router;
