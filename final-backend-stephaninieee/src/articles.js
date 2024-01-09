const mongoose = require("mongoose");
const schema = require("./schema");
const User = mongoose.model("user", schema.userSchema);
const Profile = mongoose.model("profile", schema.profileSchema);
const Article = mongoose.model("article", schema.articleSchema);
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

const getArticles = async (req, res) => {
    const loggedInUser = req.username;
    const id = req.params.id;
    try {
      let articles;
  
      if (id) {
        const queryKey = isNaN(id) ? 'author' : 'pid';
        articles = await Article.find({ [queryKey]: id });
      } else {
        const loggedInUserObj = await Profile.findOne({ username: loggedInUser });
        if (!loggedInUserObj) {
          return res.status(404).json({ message: "User profile not found" });
        }
        articles = await Article.find({
          author: { $in: [loggedInUser, ...loggedInUserObj.following] }
        });
      }
      res.json({ articles });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while retrieving articles", error: error.message });
    }
  };
  

const postArticle = async (req, res) => {
    const { username: loggedInUser, body: { title, text } } = req;
    if (!title || !text) {
      return res.status(400).json({ message: "Article title and text are required." });
    }
    try {
      const newArticle = new Article({
        pid: Date.now(), 
        author: loggedInUser,
        title,
        text,
        date: new Date(), 
        comments: []
      });
      await newArticle.save();
      res.status(201).json({ article: newArticle });
    } catch (error) {
      res.status(500).json({ message: "Error posting the article", error: error.message });
    }
  };
  
  const updateArticles = async (req, res) => {
    const { username: loggedInUser, params: { id: pid }, body: { text: newText, commentId } } = req;
  
    try {
      const article = await Article.findOne({ pid });
      if (!article) {
        return res.status(404).send("Article not found.");
      }
      if (article.author !== loggedInUser) {
        return res.status(403).send("You are not authorized to edit this article.");
      }
      if (!newText) {
        return res.status(400).send("Article text is required.");
      }
  
      if (commentId === -1) {
        const newCommentId = Date.now(); 
        article.comments.push({ commentId: newCommentId, comment: newText });
      } else {
        article.text = newText;
      }
  
      await article.save();
      res.json({ article });
    } catch (error) {
      res.status(500).send("An error occurred while updating the article.");
    }
  };

  const postArticleImg = async (req, res) => {
    if (!req.body.text) {
      // no text
      res
        .status(400)
        .send("Please include article title and text you want to post");
      return;
    }
    //const loggedInUser = req.username;
    //const title = req.body.text[0];
    //const text = req.body.text[1];
    const { username: loggedInUser, body: { title, text } } = req;
    const cloudinaryUrl = req.fileurl;

    const cloudinaryUrlHttps = "https" + cloudinaryUrl.substring(4);
  
    const newArticle = new Article({
      pid: Date.now(),
      author: loggedInUser,
      title: title,
      text: text,
      date: Date.now(),
      comments: [],
      img: cloudinaryUrlHttps,
    });
    await newArticle.save();
    res.send({ articles: [newArticle] });
    
  };
  
  
/*module.exports = (app) => {
    app.get("/articles/:id?", getArticles);
    app.put("/articles/:id", updateArticles);
    app.post("/article", postArticle);
    //app.post("/articleImg", fileUpload.uploadImage("publicId"), postArticleImg);
  };*/ 


  function setupRoutes(app) {
    app.get("/articles/:id?", getArticles);
    app.put("/articles/:id", updateArticles);
    app.post("/article", postArticle);
    app.post("/articleImg", uploadimg.uploadImage("publicId"), postArticleImg);
}

const articleFunctions = {
    getArticles, 
    updateArticles, 
    postArticle,
    postArticleImg
};

module.exports = {
    setupRoutes,
    articleFunctions
};