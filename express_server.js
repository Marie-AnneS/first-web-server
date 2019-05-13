const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser"); // !!! a enleve
const cookieSession = require("cookie-session");
const express = require("express");
const http = require("http");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.listen(PORT, () => {});
app.use(cookieSession({
  name: 'session',
  keys: ["secretkeys"]
}))

//  --------- DATABASE  -------------------------  //

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  bdfixQ: { longURL: "https://www.telequebec.tv", userID: "22sd2" },
  irf44r: { longURL: "https://fr.wiktionary.org", userID: "22sd2" }
};

const userDB = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "t1@t1.com",
    password: bcrypt.hashSync("t1", 10)
  },
  "22sd2": {
    id: "22sd2",
    email: "t2@22.com",
    password: bcrypt.hashSync("t1", 10)
  }
};

//  --------- Function  -------------------------  //

//    funtion Obligatoire
const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substr(7);

const findUserId = (user_id_bd, user_id) => {
  for (const key in user_id_bd) {
    if (user_id_bd[key].userID === user_id) {
      return true;
    }
  }
  return false;
};
//!!! enlever
const findEmail = (dB, email) => {
  for (const key in dB) {
    if (dB[key].email === email) {
      return key;
    }
  }
  return false;
};

const findUserByEmail = (dB, email) => {
  for (const key in dB) {
    if (dB[key].email === email) {
      return key;
    }
  }
  return false;
};

const urlsForUser = id => {
  var copie_UrlDatabase = Object.assign({}, urlDatabase);
  // var userId = findUserId(copie_UrlDatabase, id)
  for (const key in copie_UrlDatabase) {
    if (copie_UrlDatabase[key].userID !== id) {
      copie_UrlDatabase;
      delete copie_UrlDatabase[key];
    }
  }
  return copie_UrlDatabase;
};
//    funtion Optionel

const addNewUser = (email, password) => {
  const id = generateRandomString();
  const obj_id = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  userDB[id] = obj_id;
  return obj_id;
};
//!!! pas utilise
const addNewObjUrl = (longUrl, user_id) => {
  const NewObjURL = {
    longUrl: longUrl,
    user_id: user_id
  };
  return NewObjURL;
};

const authentif = function(email, passwordpm) {
  var userId = findUserByEmail(userDB, email);
  if (userId && bcrypt.compareSync(passwordpm, userDB[userId].password)) {
    return true;
  }
};

const deleteUrl = idUrl => {
  delete urlDatabase[idUrl];
}; //deleteUrl("9sm5xK"); console.log(urlDatabase);

//-------------GET  Mes routes des pages   ---------//

app.get("/", (req, res) => {
  /* if (user_id){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  } */
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const usertest = req.cookies.user_id;
  console.log(usertest);
  let templateVars = {
    findUserId: findUserId(urlDatabase, req.cookies.user_id),
    longURL: urlDatabase[req.cookies.user_id],
    obsUser: userDB[req.cookies.user_id],
    shortURL: req.params.shortURL,
    urlDatabase: urlDatabase,
    urlsForUser: urlsForUser(req.cookies.user_id), //urlsForUser
    user_email: req.cookies["email"],
    user_id: req.cookies.user_id,
    user_password: req.cookies["password"],
    userDB: userDB
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    obsUser: userDB[req.cookies.user_id],
    user_id: req.cookies.user_id,
    urls: urlsForUser(req.cookies.user_id)
  };
  if (templateVars.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    objURL: urlDatabase[req.params.shortURL],
    obsUser: userDB[req.cookies.user_id],
    shortURL: req.params.shortURL,
    urls: urlsForUser(req.cookies.user_id),
    user_email: req.cookies["email"],
    user_id: req.cookies.user_id,
    user_password: req.cookies["password"],
    userDB: userDB
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const longURL = urlDatabase[shortUrl].longURL;

  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies.user_id,
    userDB: userDB,
    obsUser: userDB[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.cookies.user_id,
    userDB: userDB,
    obsUser: userDB[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

// !!! avoir s'il faut garder
app.get("/logout", (req, res) => {
  let templateVars = {
    user_id: req.cookies.user_id,
    user_email: req.cookies["email"],
    user_password: req.cookies["password"],
    userDB: userDB
  };
  res.render("urls_index", templateVars);
});

//-----------   POST  ---------------//

app.post("/urls", (req, res) => {
  const ramdomShortUrl = generateRandomString();
  const LongUrl = req.body.longURL;
  const user = req.cookies.user_id;

  urlDatabase[ramdomShortUrl] = { longURL: LongUrl, userID: user };
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  urlDatabase[req.params.shortURL].longURL = req.body.newUrl; // Log the POST request body to the console
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  deleteUrl(shortUrl);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user_id = findUserByEmail(userDB, email);

  if (authentif(email, password)) {
    res.cookie("user_id", user_id);
    res.cookie("user_email", email);
    res.cookie("user_password", password);
    res.redirect("/urls");
  } else {
    res.status(403).send("Votre email ou passe]word n'est pas le bon");
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const criptPassword = bcrypt.hashSync(password, 10);
  let user_id = findUserByEmail(userDB, email);

  if (user_id || !email || !password) {
    res.status(400).send("Votre Email ou Password existe deja");
  } else {
    let new_user = addNewUser(email, criptPassword);
    res.cookie("user_id", new_user.id);
    res.cookie("user_email", email);
    res.cookie("user_password", criptPassword);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  //const email = userDB[user].email;
  //const password = userDB[user].password;
  res.clearCookie("user_id");
  res.clearCookie("user_email");
  res.clearCookie("user_password");
  res.redirect("/urls");
});
