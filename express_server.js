const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const express = require("express");
const http = require("http");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.listen(PORT, () => {});
app.use(
  cookieSession({
    name: "session",
    keys: ["secretkeys"]
  })
);

//  --------- DATABASE  -------------------------  //

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  bdfixQ: { longURL: "https://www.telequebec.tv", userID: "22sd2" },
  irf44r: { longURL: "https://fr.wiktionary.org", userID: "22sd2" }
};

const userDB = {
  aJ48lW: {
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

//-----------   Require Function    ---------//

const generateRandomString = () =>
  Math.random()
    .toString(36)
    .substr(7);

const findUserId = (userDb, userId) => {
  for (const key in userDb) {
    if (userDb[key].id === userId) {
      return userDb[key];
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
  for (const sortKey in copie_UrlDatabase) {
    if (copie_UrlDatabase[sortKey].userID !== id) {
      delete copie_UrlDatabase[sortKey];
    }
  }
  return copie_UrlDatabase;
};

//-----------   Optionel Function    ---------//

const addNewUser = (email, password) => {
  const id = generateRandomString();
  const userObj = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  userDB[id] = userObj;
  return userObj;
};

const authentif = function(email, passwordpm) {
  var userId = findUserByEmail(userDB, email);
  if (userId && bcrypt.compareSync(passwordpm, userDB[userId].password)) {
    return userId;
  }
};

const deleteUrl = idUrl => {
  delete urlDatabase[idUrl];
};

//-------------GET  Mes routes des pages   ---------//

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    findUserId: findUserId(userDB, req.session.user_id), //!!! user obj ou false
    longURL: urlDatabase[req.session.user_id],
    obsUser: userDB[req.session.user_id], //@@@ ? pas capabkle autrement
    urlsForUser: urlsForUser(req.session.user_id) //!!! a garder
  };
  if (!findUserId) {
    res.status(401).send("Status 401 : You are not login");
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    findUserId: findUserId(userDB, req.session.user_id), //!!! user obj ou false

    obsUser: userDB[req.session.user_id],
    user_id: req.session.user_id,
    urls: urlsForUser(req.session.user_id)
  };
  if (templateVars.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    return res.status(404).send("Status 404 : page dont existe ");
  }
  let templateVars = {
    shortURL,
    longURL: longURL.longURL,
    findUserId: findUserId(userDB, req.session.user_id),
    obsUser: userDB[req.session.user_id],
    urlsForUser: urlsForUser(req.session.user_id)
  };
  if (!templateVars.findUserId) {
    return res.status(403).send("Status 403 : You do not have access to this page");
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const longURL = urlDatabase[shortUrl].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    findUserId: findUserId(userDB, req.session.user_id),
    obsUser: userDB[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    findUserId: findUserId(userDB, req.session.user_id),
    obsUser: userDB[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/logout", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    userDB: userDB
  };
  res.render("urls_index", templateVars);
});

//-----------   POST  ---------------//

app.post("/urls", (req, res) => {
  const ramdomShortUrl = generateRandomString();
  const LongUrl = req.body.longURL;
  const user = req.session.user_id;
  urlDatabase[ramdomShortUrl] = { longURL: LongUrl, userID: user };
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.newUrl;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  const urls = urlsForUser(req.session.user_id);
  console.log(urls);
  if (urls[shortUrl]) {
    deleteUrl(shortUrl);
    res.redirect("/urls");
  } else {
    res.status(403).send("Status 403 : you can not do this action");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let user_id = authentif(email, password);
  if (user_id) {
    req.session.user_id = user_id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Status 403 : Bad email or passeword");
  }
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let user_id = findUserByEmail(userDB, email);
  if (user_id) {
    res.status(403).send("Status 403 : Email already exists");
  } else if (!email || !password) {
    res.status(403).send("Status 403 : empty email or password ");
  } else {
    let new_user = addNewUser(email, password);
    req.session.user_id = new_user.id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
