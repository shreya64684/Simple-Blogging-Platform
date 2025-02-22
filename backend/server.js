const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const path = require('path');
const dotenv = require("dotenv");
const { env } = require("process");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "../frontend")));

// Route to serve the index.html file on the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
  });

AWS.config.update({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
 }); // Change to your AWS region
const dynamoDB = new AWS.DynamoDB.DocumentClient();
console.log(dynamoDB);

const TABLE_NAME = "BlogPosts";

// Add a new blog post
app.post("/addPost", async (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) return res.status(400).json({ error: "All fields required" });

    const post = {
        PostId: uuidv4(),
        Title: title,
        Content: content,
        Author: author,
        Timestamp: new Date().toISOString(),
    };
    console.log("Post: ", post);
    try {
        await dynamoDB.put({ TableName: TABLE_NAME, Item: post }).promise();
        console.log("Post added successfully!");
        res.json({ message: "Post added successfully!", post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all blog posts
app.get("/getPosts", async (req, res) => {
    try {
        const data = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
        console.log("All posts: ", data)
        res.json(data.Items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post
app.delete("/deletePost/:id", async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        await dynamoDB.delete({ TableName: TABLE_NAME, Key: { PostId: id } }).promise();
        console.log("Post deleted successfully!");
        res.json({ message: "Post deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
