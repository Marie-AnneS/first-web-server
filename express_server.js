const http = require("http");
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const deleteUrl = ( idUrl ) => {
  //console.log(urlDatabase);
  delete urlDatabase[idUrl];
}; //deleteUrl("9sm5xK"); console.log(urlDatabase);

//route des pages
app.post("/urls", (req, res) => {
  urlDatabase["new_url"] = req.body.longURL; // Log the POST request body to the console
  console.log(urlDatabase);
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortURL;
  //let templateVars = { urls: urlDatabase };
  deleteUrl(shortUrl);
  //res.render("urls_index", templateVars);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL;
  let templateVars = { shortURL: shortUrl, longURL: urlDatabase[shortUrl] };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
