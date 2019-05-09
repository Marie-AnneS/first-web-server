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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/* const loginId = user => {
  if (user){
    ret
  }
}; */

const deleteUrl = idUrl => {
  //console.log(urlDatabase);
  delete urlDatabase[idUrl];
}; //deleteUrl("9sm5xK"); console.log(urlDatabase);

app.post("/urls", (req, res) => {
  urlDatabase["new_url"] = req.body.longURL; // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

//Do i need /logout
app.post("/logout", (req, res) => {
  const user = req.body.username;
  res.clearCookie("username", user);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const user = req.body.username;
  res.cookie("username", user);
/*   let putUser = () => {res.cookie("username", user);};   
  let ereaseUser = () => {res.clearCookie("username", user);};
  user ? putUser() : ereaseUser() ; */
  res.redirect("/urls");
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

//    -------------  Mes routes des pages   ---------
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
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
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  let templateVars = {
    username: req.cookies["username"],
    shortURL: shortUrl,
    longURL: urlDatabase[shortUrl]
  };
  res.render("urls_show", templateVars);
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
