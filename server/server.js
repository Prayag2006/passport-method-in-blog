const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { connectDB } = require('./database');
const initializePassport = require('./passport-config');
const User = require('./models/User');
const Post = require('./models/Post');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_super_secret_jwt_key_here';

// Connect to MongoDB
connectDB();

initializePassport(passport);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

const authenticateToken = passport.authenticate('jwt', { session: false });

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: newUser._id, username } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ error: 'Server error during login' });
    if (!user) return res.status(400).json({ error: info.message || 'Login failed' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, username: user.username } });
  })(req, res, next);
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author_id', 'username')
      .sort({ createdAt: -1 });
    
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      author_name: post.author_id.username,
      id: post._id
    }));
    
    res.json(formattedPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});
post = await Post.findById(req.params.id)
      .populate('author_id', 'username');
    
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    const formattedPost = {
      ...post.toObject(),
      author_name: post.author_id.username,
      id: post._id
    };
    
    res.json(formattedPsts.id = ?
    `, [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.post('newPost = new Post({
      title,
      content,
      image_url,
      author_id: req.user.id
    });
    
    await newPost.save();
    res.json({ 
      id: newPost._id, 
      title, 
      content, 
      image_url, 
      author_id: req.user.id 
   ',post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this post' });
    }

    post.title = title;
    post.content = content;
    post.image_url = image_url;
    await post.save();
    
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  const { title, content, image_url } = req.body;
  try {
    const db = await getDbConnection();
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized to edit this post' });

    await db.run(
      'UPDpost = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDbConnection();
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized to delete this post' });

    await db.run('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



