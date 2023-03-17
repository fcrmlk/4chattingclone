require('dotenv').config()
/* NPM PACKAGES */
const express = require("express"),
  path = require("path"),
  cors = require("cors"),
  http = require("http"),
  https = require("https"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  logger = require("morgan"),
  fs = require("fs"),
  httpsMode = process.env.SSL;

/* API ROUTES */
const api = require("./server/routes/api");
const admin = require("./server/routes/admin");

/* ADMIN ROUTES */
const user = require("./server/routes/user");
const help = require("./server/routes/help");

const app = express();
app.use(express.urlencoded({ extended: "true", limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(passport.initialize());
// if (process.env.DEBUG === "1") {
//   app.use(logger("dev"));
// }
app.use(passport.session());
require("./server/userjwt")(passport);
app.use("/service", api);
app.use("/admin", admin);
app.use("/user", user);
app.use("/help", help);
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(__dirname + "/src"));
app.use("/media", express.static(__dirname + "/src/assets/public"));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("*", (req, res) => {
   res.status(404).send('Not found');
});

/* MONGO DB CONNECTIVITY */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
  .then(
    () => {
      console.log("Mongodb is connected");
    },
    err => {
      console.log("Cannot connect to the mongodb" + err);
    }
  );

/* EXPRESS SERVER CONNECTIVITY */
let server;
if (httpsMode == 1) {
  /* SSL CERTIFICATES */
  let privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH);
  let certificate = fs.readFileSync(process.env.SSL_CERT_PATH);
  let ca = fs.readFileSync(process.env.SSL_CHAIN_PATH);
  const sslOptions = {
    key: privateKey,
    cert: certificate,
    ca: ca
  };
  server = https.createServer(sslOptions, app);
  server.listen(process.env.API_PORT, () => console.log(`API Server is running on :${process.env.API_PORT}`));
} else {
  server = http.createServer(app);
  server.listen(process.env.API_PORT, () => console.log(`API Server is running on :${process.env.API_PORT}`));
}
