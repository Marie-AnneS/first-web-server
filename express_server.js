const http = require("http");
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDB = {
  "22yy22": {
    id: "22yy22",
    email: "marie.anne.seim@gmail.com",
    password: "poire"
  },
  "22sd2": {
    id: "22sd22",
    email: "anne.seim@gmail.com",
    password: "poire"
  }
};

const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substr(7);

const addNewUser = (email, password) => {
  const idGenerate = generateRandomString();
  const userCript = {
    id: idGenerate,
    email: email,
    password: password
  };

  userDB[idGenerate] = userCript;
  return userCript;
};

const addUser = userId => {
  userDB.user = userId;
  //console.log(userDB);
};

const findEmail = (dB, email) => {
  for (const key in dB) {
    if (dB[key].email === email) {
      return key;
    }
  }
  return false;
};
//var strpassword = "poire";

const authentif = function(email, passwordpm) {
  var user = findEmail(userDB, email);

  if (user) {
    if (userDB[user].password === passwordpm) {
      console.log(userDB[user].password);
      return true;
    }
    //console.log(userDB[user].password === strpassword);
  }
};
//console.log(findEmail(userDB, "marie.anne.seim@gmail.com"));
//console.log(verifPass(strpassword));

const deleteUrl = idUrl => {
  delete urlDatabase[idUrl];
}; //deleteUrl("9sm5xK"); console.log(urlDatabase);

//-----------   POST  ---------------//

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL; // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/logout", (req, res) => {
  const user = req.cookies["user_id"];
  console.log(user);
  const email = userDB[user].email;
  const password = userDB[user].password;

  res.clearCookie("user_id", user);
  res.clearCookie("user_email", email);
  res.clearCookie("user_password", password);

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user_id = findEmail(userDB, email);

  if (authentif(email, password)) {
    res.cookie("user_id", user_id);
    res.cookie("user_email", email);
    res.cookie("user_password", password);
    res.redirect("/urls");
  } else {
    res.status(403).send("Votre email ou passe]word n'est pas le bon");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  urlDatabase[shortUrl] = req.body.newUrl; // Log the POST request body to the console
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  deleteUrl(shortUrl);
  //console.log(shortUrl);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // const user = returnUser( userDB, email );
  let user_id = findEmail(userDB, email);

  if (user_id || !email || !password) {
    res.status(400).send("Votre Email ou Password existe deja");
  } else {
    let new_user = addNewUser(email, password);
    res.cookie("user_id", new_user.id);
    res.cookie("user_email", email);
    res.cookie("user_password", password);
    res.redirect("/urls");
  }
});

//-------------GET  Mes routes des pages   ---------//

app.get("/urls", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase,
    obsUser: userDB[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  let longURL = urlDatabase[shortUrl];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    urls: urlDatabase,
    obsUser: userDB[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  let templateVars = {
    user_id: req.cookies["user_id"],
    shortURL: shortUrl,
    userDB: userDB,
    longURL: urlDatabase[shortUrl],
    obsUser: userDB[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    userDB: userDB,
    obsUser: userDB[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    userDB: userDB,
    obsUser: userDB[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

app.get("/logout", (req, res) => {
  let templateVars = {
    user_id: req.cookies["user_id"],
    user_email: req.cookies["email"],
    user_password: req.cookies["password"],
    userDB: userDB
  };
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
