const express = require('express');
const app = express()
const cors = require('cors');
const mongoose = require("mongoose");
const User = require('./models/User');
const Post = require('./models/Post');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb+srv://rashmidaswaththa:8jEcVPDDbbdpCHqc@cluster0.qlbpdgl.mongodb.net/?retryWrites=true&w=majority');


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password,
        });
        res.json(userDoc);
    } catch (e) {
        console.log(e);
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (userDoc) {
        if (password === userDoc.password) {
            res.json({ message: "login sucess" })
        } else {
            res.json({ message: "wrong credentials" })
        }
    } else {
        res.json("not register")
    }
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const { title, summary, content, author} = req.body;
    const postDoc = await Post.create({
        title,
        summary,
        content,
        cover: newPath,
        author,
    });
    res.json(postDoc);


});

app.get('/post', async (req,res) => {
    res.json(
      await Post.find()
        .sort({createdAt: -1})
        .limit(20)
    );
  });

  app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id);
    res.json(postDoc);
  })

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




app.listen(4000)