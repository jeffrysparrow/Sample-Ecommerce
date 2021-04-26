const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const usersRepo = require("./repositories/users");

const app = express();
// passes this middleware funtions to all route handlers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    // random encryption key to protect data
    keys: ["asdfghjkl"],
  })
);
// these are ROUTE HANDLERS
app.get("/signup", (req, res) => {
  res.send(`
    <div>
      Your id is ${req.session.userID}
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name="passwordConfirmation" placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
  `);
});

// Homebuilt bodyParser function
// const bodyParser = (req, res, next) => {
//   if (req.method === "POST") {
//     req.on("data", (data) => {
//       const parsed = data.toString("utf8").split("&");
//       const formData = {};
//       for (let pair of parsed) {
//         const [key, value] = pair.split("=");
//         formData[key] = value;
//       }
//       req.body = formData;
//       next();
//     });
//   } else {
//     next();
//   }
// };

app.post("/signup", async (req, res) => {
  // get access to form data
  const { email, password, passwordConfirmation } = req.body;

  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser) {
    return res.send("Email in use");
  }

  if (password !== passwordConfirmation) {
    return res.send("Passwords must match");
  }

  // create a user in our user repo to represent this person
  const user = await usersRepo.create({ email: email, password: password });
  // Store the id that user inside the users cookie
  // .session property is added by cookie-session middleware
  req.session.userID = user.id;
  res.send("Account Created");
});

app.get("/new", (req, res) => {
  res.send("You found this page!");
});

app.get("/signout", (req, res) => {
  req.session = null;
  res.send("you are logged out");
});

app.get("/signin", (req, res) => {
  res.send(`
  <div>
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <button>Sign In</button>
      </form>
    </div>
  `);
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await usersRepo.getOneBy({ email: email });

  if (!user) {
    return res.send("Email not found");
  }

  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );
  if (!validPassword) {
    return res.send("Invalid Password");
  }

  req.session.userID = user.id;

  res.send("You are signed in");
});

app.listen(3000, () => {
  console.log("listening...");
});
