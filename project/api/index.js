require("dotenv").config();
const connection = require("./db");
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');
const helmet = require('helmet'); // Add helmet middleware
const rateLimit = require('express-rate-limit'); // To resolve Resource limit error

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(cors());
app.use(express.json());
app.use(helmet.hidePoweredBy()); // Disable X-Powered-By header

// mongoose.connect('mongodb+srv://rashmidaswaththa:8jEcVPDDbbdpCHqc@cluster0.qlbpdgl.mongodb.net/?retryWrites=true&w=majority');
// database connection
connection();

// Function to generate a secure filename
function generateSecureFilename(originalname) {
  const ext = originalname.split('.').pop(); // Get the file extension
  const randomName = Math.random().toString(36).substring(7); // Generate a random string
  return `${Date.now()}-${randomName}.${ext}`;
}

// Define rate limit options (adjust these according to your needs)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply rate limiting middleware globally
app.use(limiter);

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password,
    });
    res.json(userDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    if (userDoc) {
      if (password === userDoc.password) {
        res.json({ message: 'login success' });
      } else {
        res.json({ message: 'wrong credentials' });
      }
    } else {
      res.json({ message: 'not registered' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const originalname = req.file.originalname;
  const secureFilename = generateSecureFilename(originalname);

  const sourcePath = req.file.path;
  const destPath = __dirname + '/uploads/' + secureFilename;

  try {
    fs.renameSync(sourcePath, destPath);

    const { title, summary, content, author } = req.body;

    // Convert specific properties to strings if necessary
    const titleString = title.toString(); // toString conversion
    const summaryString = summary.toString(); // toString conversion
    const contentString = content.toString(); // toString conversion
    const authorString = author.toString(); // toString conversion


    const postDoc = await Post.create({
      title: titleString,
      summary: summaryString,
      content: contentString,
      cover: 'uploads/' + secureFilename,
      author: authorString,
    });

    res.json(postDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading the file' });
  }
});

app.get('/post', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(20);
    res.json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id);
    if (!postDoc) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(postDoc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
//   let newPath = null;
//   if (req.file) {
//     const { originalname, path } = req.file;
//     const parts = originalname.split('.');
//     const ext = parts[parts.length - 1];
//     newPath = path + '.' + ext;
//     fs.renameSync(path, newPath);
//   }

//   const { id, title, summary, content, author } = req.body;
//   try {
//     const postDoc = await Post.updateOne(
//       id,
//       {
//         title,
//         summary,
//         content,
//         cover: newPath ? newPath : postDoc.cover,
//       },
//       { new: true }
//     );
//     if (!postDoc) {
//       return res.status(404).json({ message: 'Post not found' });
//     }
//     res.json(postDoc);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

app.put('/post', uploadMiddleware.single('file'), async (req, res) => {
  let newPath = null;
  if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path + '.' + ext;
      fs.renameSync(path, newPath);
  }

  const {id, title, summary, content , author } = req.body;
  const postDoc = await Post.findById(id);
  await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
  });

  res.json(postDoc);

});

app.listen(4000);
