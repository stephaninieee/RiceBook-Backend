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
  
  
  /*const getFollowing = async (req, res) => {
    try {
      // Use the username from the params if provided, otherwise use the logged-in user's username
      const username = req.params.user || req.username;
  
      // Find the profile for the username
      const user = await Profile.findOne({ username: username });
      if (!user) {
        // If no profile is found, return a 404 Not Found status
        return res.status(404).json({ message: "Username does not exist." });
      }
  
      res.status(200).json({ username: username, following: user.following });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while processing your request." });
    }
  };*/ 
  const getFollowing = async (req, res) => {
    try {
      const username = req.params.user || req.username;

      const userProfile = await Profile.findOne({ username: username });
      if (!userProfile) {
        return res.status(404).json({ message: "Username does not exist." });
      }

      const followingProfiles = await Promise.all(
        userProfile.following.map(async (followingUsername) => {
          return await Profile.findOne({ username: followingUsername });
        })
      );
      const validFollowingProfiles = followingProfiles.filter(profile => profile != null);
  
      res.status(200).json({ username: username, following: validFollowingProfiles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while processing your request." });
    }
  };
  
  const addFollowing = async (req, res) => {
    try {
      const loggedInUser = req.username;
      const { user } = req.params;
  
      if (!user) {
        return res.status(400).json({ message: "Please include the user you want to follow." });
      }
  
      const userToFollow = await User.findOne({ username: user });
      if (!userToFollow) {
        return res.status(404).json({ message: "Username does not exist." });
      }
  
      const loggedInUserProfile = await Profile.findOne({ username: loggedInUser });
      if (!loggedInUserProfile) {
        return res.status(404).json({ message: "Your username does not exist." });
      }
  
      if (loggedInUserProfile.following.includes(user)) {
        return res.status(409).json({ message: "You are already following this user." });
      }
  
      loggedInUserProfile.following.push(user);
      await loggedInUserProfile.save();
  
      res.status(200).json({
        username: loggedInUser,
        following: loggedInUserProfile.following
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while processing your request." });
    }
  };
  
  const deleteFollowing = async (req, res) => {
    try {
      const loggedInUser = req.username;
      const { user } = req.params;
  
      if (!user) {
        return res.status(400).json({ message: "Please include the user you want to unfollow." });
      }
  
      // Check if the user to unfollow exists
      const userToUnfollow = await User.findOne({ username: user });
      if (!userToUnfollow) {
        return res.status(404).json({ message: "Username does not exist." });
      }
  
      // Get the logged-in user's profile
      const loggedInUserProfile = await Profile.findOne({ username: loggedInUser });
      if (!loggedInUserProfile) {
        return res.status(404).json({ message: "Your username does not exist." });
      }
  
      // Check if the user is being followed
      if (!loggedInUserProfile.following.includes(user)) {
        return res.status(409).json({ message: "You are not following this user." });
      }
  
      // Delete the user from the following list
      loggedInUserProfile.following.pull(user);
      await loggedInUserProfile.save();
  
      // Send success response
      res.status(200).json({
        username: loggedInUser,
        following: loggedInUserProfile.following
      });
  
    } catch (error) {
      // Catch any other errors and send a 500 Internal Server Error
      console.error(error);
      res.status(500).json({ message: "An error occurred while processing your request." });
    }
  };
  


  module.exports = (app) => {
    app.get("/following/:user?", getFollowing);
    app.put("/following/:user", addFollowing);
    app.delete("/following/:user", deleteFollowing);
  };