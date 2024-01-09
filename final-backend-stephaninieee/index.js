// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const articlesRouter = require("./src/articles");
const authRouter = require("./src/auth");
const profileRouter = require("./src/profile");
const followingRouter = require("./src/following");
const upCloud = require("./src/uploadCloudinary.js");
const oauth = require("./src/oauth");

const FRONTEND_URL = "https://rc118-ricebook.surge.sh";

const corsOptions = {
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(
  session({
    secret: "doNotGuessTheSecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.options("*", (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://rc118-ricebook.surge.sh"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.sendStatus(204);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/current_user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ username: req.user.username });
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

oauth(app);
authRouter.setupRoutes(app);
articlesRouter.setupRoutes(app);
profileRouter(app);
followingRouter(app);
upCloud.setup(app);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
