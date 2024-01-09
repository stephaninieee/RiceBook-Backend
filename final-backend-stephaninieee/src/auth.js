const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const mongoose = require("mongoose");
const schema = require("./schema");

const User = mongoose.model("user", schema.userSchema);
const Profile = mongoose.model("profile", schema.profileSchema);

const connectionString = 'mongodb+srv://stephanie_chu:900103rungdechu@users.7nntze5.mongodb.net/?retryWrites=true&w=majority' 
mongoose.connect(connectionString, {
    dbName: "COMP531_BACKEND",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("Connected to MongoDB");
  }).catch(err => {
    console.error("Could not connect to MongoDB", err);
  });

let sessionUser = {};
let cookieKey = 'sid';
const mySecretMessage = "mysecretmessage";  

const defaultHeadline = "This is the default headline.";


const generateSessionKey = (username) => {
    return md5(mySecretMessage + new Date().getTime() + username);
};

//handle login
const handleLogin = async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).send("Missing username or password.");
      }
    
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).send("Username does not exist.");
      }
    
      const isMatch = await bcrypt.compare(password, user.hash);
      if (!isMatch) {
        return res.status(403).send("Incorrect password.");
      }
    
      const sessionKey = generateSessionKey(username);
      sessionUser[sessionKey] = username;
      res.cookie(cookieKey, sessionKey, {
        maxAge: 3600 * 1000,
        httpOnly: true,
        sameSite: "None",
        secure: true,

      });
     //console.log("add cookie", cookieKey, sessionKey);
      res.send({ username, result: "success" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  };



// Handle logout
const handleLogout = (req, res) => {
    const sid = req.cookies[cookieKey];
    if (sid) {
      delete sessionUser[sid];
      res.clearCookie(cookieKey);
      res.status(200).send('OK');
      
    } else {
      res.status(401).send('No session to log out.');
    }
  };
  const handleRegister = async (req, res) => {
    try {
      const { username, phone, email, dob, zipcode, password } = req.body;
      if (!username || !password) {
        return res.status(400).send("Missing username or password");
      }
    
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).send("Username is already taken.");
      }
    
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
    
      const newUser = new User({ username, auth: ["password"], salt, hash });
      await newUser.save();

      const newProfile = new Profile({
        username: username,
        headline: defaultHeadline,
        following: [],
        phone : phone, 
        email: email,
        dob: dob,
        zipcode: zipcode,
        avatar: "",
      });
    
      await newProfile.save();
    
      const sessionKey = generateSessionKey(username);
      sessionUser[sessionKey] = username;
      res.cookie(cookieKey, sessionKey, {
        maxAge: 3600 * 1000,
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res.send({ result: "success", username });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  };

// Middleware to check if user is logged in using dummy data
const isLoggedIn = (req, res, next) => {
    const sid = req.cookies[cookieKey];
    const username = sessionUser[sid];
    if (username) {
      req.username = username;
      next();
    } else {
      res.status(401).send('You must be logged in.');
    }
  };


// Handle password 
const setPassword = async (req, res) => {
    const { newPassword } = req.body;
    const username = req.username; 
    try {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(newPassword, salt);

      await User.updateOne({ username: username }, { salt: salt, hash: hash });
      res.send({ username: username, result: 'success' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error.');
    }
};


/*module.exports = (app) => {
    app.post("/login", handleLogin);
    app.post("/register", handleRegister);
    app.use(isLoggedIn);
    app.put("/logout", handleLogout);
    app.put("/password", setPassword);
  };*/ 

 
  function setupRoutes(app) {
      app.post("/login", handleLogin);
      app.post("/register", handleRegister);
      app.use(isLoggedIn);
      app.put("/logout", handleLogout);
      app.put("/password", setPassword);
  }
  
  const authFunctions = {
    handleLogin,
    handleLogout,
    handleRegister,
    setPassword
  };
  
  module.exports = {
      setupRoutes,
      authFunctions,
      cookieKey, sessionUser
  };

