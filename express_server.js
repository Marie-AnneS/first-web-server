const http = require("http");
var express = require("express");
var app = express();
var PORT = 8080; 
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

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
    email: "marie.anne.seim@gmail.com",
    password: "poire"
  },
  "22sd2": {
    id: "22sd22",
    email: "anne.seim@gmail.com",
    password: "anne"
  }
};

//  --------- Function  -------------------------  //
const findUserId = (user_id_bd, user_id) => {
  for (const key in user_id_bd) {
    if (user_id_bd[key].userID === user_id) {
      return true;
    }
  }
  return false;
};

/* This one don't work's
const urlsForUser = (id) => {
  var arrUrlfromShort = []; 
  var copieurUrlDatabase = Object.assign({}, urlDatabase); 

  var userId = findUserId(copieurUrlDatabase, id)
   for (const key in copieurUrlDatabase) {
    if (copieurUrlDatabase[key].userID === id){
      arrUrlfromShort.push(copieurUrlDatabase[key].longURL);
    }
  } 
  return arrUrlfromShort;
}; */

const dbForUser = (id) => {
  var copieurUrlDatabase = Object.assign({}, urlDatabase); 
  var userId = findUserId(copieurUrlDatabase, id)
   for (const key in copieurUrlDatabase) {
    if (copieurUrlDatabase[key].userID !== id){
      copieurUrlDatabase
      delete copieurUrlDatabase[key];
    }
  } 
  return copieurUrlDatabase;
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

const addNewObjUrl = (longUrl, user_id) => {
  const NewObjURL = {
    longUrl: longUrl,
    user_id: user_id
  };
  return NewObjURL;
}

const findEmail = (dB, email) => {
  for (const key in dB) {
    if (dB[key].email === email) {
      return key;
    }
  }
  return false;
};

const scriptCompareSync = (pw, hashPw) => {
  return bcrypt.compareSync(pw, hashPw);
}

const authentif = function(email, passwordpm) {
  
  var userId =  findEmail(userDB, email)
  if (userId && bcrypt.compareSync(passwordpm, userDB[userId].password)) {
      return true;
  }
};

const deleteUrl = idUrl => {
  delete urlDatabase[idUrl];
}; //deleteUrl("9sm5xK"); console.log(urlDatabase);

//-----------   POST  ---------------//

app.post("/urls", (req, res) => {
  const ramdomShortUrl = generateRandomString();
  const LongUrl = req.body.longURL;
  const user = req.cookies["user_id"];  
  urlDatabase[ramdomShortUrl] = { longURL: LongUrl, userID: user }  
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/logout", (req, res) => {
  const user = req.cookies["user_id"];
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
  urlDatabase[req.params.shortURL].longURL = req.body.newUrl; // Log the POST request body to the console
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  deleteUrl(shortUrl);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const criptPassword = bcrypt.hashSync(password, 10); 
  let user_id = findEmail(userDB, email);

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

//-------------GET  Mes routes des pages   ---------//

app.get("/urls", (req, res) => {
  let templateVars = {
    findUserId: findUserId(urlDatabase ,req.cookies["user_id"]),
    longURL: urlDatabase[req.cookies["user_id"]],
    obsUser: userDB[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    urlDatabase: urlDatabase,
    urlsForUser: dbForUser(req.cookies["user_id"]), //urlsForUser
    user_email: req.cookies["email"],
    user_id: req.cookies["user_id"],
    user_password: req.cookies["password"],
    userDB: userDB,
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  const longURL = urlDatabase[shortUrl].longURL;
 
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    obsUser: userDB[req.cookies["user_id"]],
    user_id: req.cookies["user_id"],
    urls: dbForUser(req.cookies["user_id"]),
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
    obsUser: userDB[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    urls: dbForUser(req.cookies["user_id"]),
    user_email: req.cookies["email"],
    user_id: req.cookies["user_id"],
    user_password: req.cookies["password"],
    userDB: userDB,
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
