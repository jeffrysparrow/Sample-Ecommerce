const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const authRouter = require("./routes/admin/auth");

const app = express();
app.use(express.static("public"));
// passes this middleware funtions to all route handlers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    // random encryption key to protect data
    keys: ["asdfghjkl"],
  })
);
app.use(authRouter);

app.listen(3000, () => {
  console.log("listening...");
});
