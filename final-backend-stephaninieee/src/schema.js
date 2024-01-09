const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  auth: {
    type: [],
    required: true,
  },
  salt: {
    type: String,
  },
  hash: {
    type: String,
  },
  googleAuth: { 
    type: Boolean, 
    required: true, 
    default: false },
});

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  dob: {
    type: String,
    required: [true, "Dob is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
  },
  following: {
    type: [],
  },
  headline: {
    type: String
  },
  zipcode: {
    type: Number,
    required: [true, "Zipcode is required"],
  },
  avatar: {
    type: String,
  },
});

const articleSchema = new mongoose.Schema({
  pid: {
    type: Number,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  text: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  comments: {
    type: [],
    required: true,
  },
  img: {
    type: String,
  },
});

module.exports = {
  userSchema: userSchema,
  profileSchema: profileSchema,
  articleSchema: articleSchema,
};