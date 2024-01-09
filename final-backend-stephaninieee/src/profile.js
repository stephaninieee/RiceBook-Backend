const mongoose = require("mongoose");
const schema = require("./schema");
const Profile = mongoose.model("profile", schema.profileSchema);
const uploadimg = require("./uploadCloudinary");

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

const getHeadline = async (req, res) => {
    const { user } = req.params;
    if (user) {
      try {
        const profileObj = await Profile.findOne({ username: user });
        if (profileObj) {
          res.status(200).send({ username: user, headline: profileObj.headline });
        } else {
          res.status(400).send("User not found");
        }
      } catch (error) {
        res.status(500).send("An error occurred while fetching the headline");
      }
    } else {
      res.status(400).send("Please include username");
    }
  };
  
const setHeadline = async (req, res) => {
    const loggedInUser = req.username;
    const newHeadline = req.body.headline;
    if (!newHeadline) {
        res.status(400).send("Please send headline you want to update");
    return;
  }
    const profileObj =  await Profile.findOne({ username: loggedInUser });
    profileObj.headline = newHeadline;
    await profileObj.save();
    res.status(200).send({ username: loggedInUser, headline: newHeadline });
};


const getEmail = async (req, res) => {
    const { user } = req.params;
    if (user) {
      try {
        const profileObj = await Profile.findOne({ username: user });
        if (profileObj) {
          res.status(200).send({ username: user, email: profileObj.email });
        } else {
          res.status(400).send("User not found");
        }
      } catch (error) {
        res.status(500).send("An error occurred while fetching the email");
      }
    } else {
      res.status(400).send("Please include username");
    }
  };
  

const setEmail = async (req, res) => {
  const loggedInUser = req.username;
  const newEmail = req.body.email;
  if (!newEmail) {
    res.status(400).send("Please include email you want to update");
    return;
  }

  const profileObj =  await Profile.findOne({ username: loggedInUser });
  profileObj.email = newEmail;
  await profileObj.save();
  res.status(200).send({ username: loggedInUser, email: newEmail });
};



const getDob = async (req, res) => {
    const { user } = req.params;
    if (user) {
      try {
        const profileObj = await Profile.findOne({ username: user });
        if (profileObj) {
          res.status(200).send({ username: user, dob: profileObj.dob });
        } else {
          res.status(400).send("User not found");
        }
      } catch (error) {
        res.status(500).send("An error occurred while fetching the date of birth");
      }
    } else {
      res.status(400).send("Please include username");
    }
  };
  


const getZipcode = async (req, res) => {
    const { user } = req.params;
  
    if (user) {
      try {
        const profileObj = await Profile.findOne({ username: user });
  
        if (profileObj) {
          res.status(200).send({ username: user, zipcode: profileObj.zipcode });
        } else {
          res.status(400).send("User not found");
        }
      } catch (error) {
        res.status(500).send("An error occurred while fetching the zipcode");
      }
    } else {
      res.status(400).send("Please include username");
    }
  };
  
const setZipcode = async (req, res) => {
  const loggedInUser = req.username;
  const newZipcode = req.body.zipcode;
  if (!newZipcode) {
    res.status(400).send("Please include zipcode you want to update");
    return;
  }
  const profileObj =   await Profile.findOne({ username: loggedInUser });
  profileObj.zipcode = newZipcode;
  await profileObj.save();
  res.status(200).send({ username: loggedInUser, zipcode: newZipcode });
};


  const getPhone = async (req, res) => {
    const { user } = req.params;
  
    if (user) {
      try {
        const profileObj = await Profile.findOne({ username: user });
  
        if (profileObj) {
          res.status(200).send({ username: user, phone: profileObj.phone });
        } else {
          res.status(400).send("User not found");
        }
      } catch (error) {
        res.status(500).send("An error occurred while fetching the phone number");
      }
    } else {
      res.status(400).send("Please include username");
    }
  };
  
  const setPhone = async (req, res) => {
    const loggedInUser = req.username;
    const newPhone = req.body.phone;
    if (!newPhone) {
      return res.status(400).send("Please include phone number you want to update");
    }
    const profileObj =   await Profile.findOne({ username: loggedInUser });
    if (!profileObj) {
      return res.status(400).send("User not found");
    }
    profileObj.phone = newPhone;
    return res.status(200).send({ username: loggedInUser, phone: newPhone });
  };

  const getAvatar = async (req, res) => {
    const { user } = req.params;
    if (!user) {
      res.status(400).send("Please include username");
    } else {
      const profileObj = await Profile.findOne({ username: user });
      if (!profileObj) {
        res.status(400).send("User not found");
      } else {
        res.status(200).send({ username: user, avatar: profileObj.avatar });
      }
    }
  };
  
  const setAvatar = async (req, res) => {
    // console.log(req.fileurl);
    const loggedInUser = req.username;
    const newAvatarUrl = req.fileurl;
  
    // change newAvatarUrl from http to https to avoid warming
    const newAvatarUrlHttps = "https" + newAvatarUrl.substring(4);
  
    if (!newAvatarUrlHttps) {
      res.status(400).send("Please include cloudinary url you want to update");
      return;
    }
    const profileObj = await Profile.findOne({ username: loggedInUser });
    profileObj.avatar = newAvatarUrlHttps;
    await profileObj.save();
    res.status(200).send({ username: loggedInUser, avatar: newAvatarUrlHttps });
  };
  

module.exports = (app) => {
    app.get("/headline/:user?", getHeadline);
    app.put("/headline", setHeadline);
    app.get("/email/:user?", getEmail);
    app.put("/email", setEmail);
    app.get("/dob/:user?", getDob);
    app.get("/zipcode/:user?", getZipcode);
    app.put("/zipcode", setZipcode);
    app.get('/phone/:user?', getPhone);
    app.put('/phone', setPhone);
    app.get("/avatar/:user?", getAvatar);
    app.put("/avatar", uploadimg.uploadImage("publicId"), setAvatar);
  };

