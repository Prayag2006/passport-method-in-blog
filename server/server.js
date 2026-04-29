const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { getDbConnection } = require('./database');
const initializePassport = require('./passport-config');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_super_secret_jwt_key_here';

initializePassport(passport);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

const authenticateToken = passport.authenticate('jwt', { session: false });

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const db = await getDbConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    const token = jwt.sign({ id: result.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: result.lastID, username } });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      if (error.message.includes('username')) return res.status(400).json({ error: 'Username already exists' });
      if (error.message.includes('email')) return res.status(400).json({ error: 'Email already exists' });
      return res.status(400).json({ error: 'Username or Email already exists' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return res.status(500).json({ error: 'Server error during login' });
    if (!user) return res.status(400).json({ error: info.message || 'Login failed' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username } });
  })(req, res, next);
});

app.get('/api/posts', async (req, res) => {
  try {
    const db = await getDbConnection();
    const posts = await db.all(`
      SELECT posts.*, users.username as author_name 
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      ORDER BY posts.created_at DESC
    `);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const post = await db.get(`
      SELECT posts.*, users.username as author_name 
      FROM posts 
      JOIN users ON posts.author_id = users.id 
      WHERE posts.id = ?
    `, [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  const { title, content, image_url } = req.body;
  try {
    const db = await getDbConnection();
    const result = await db.run(
      'INSERT INTO posts (title, content, image_url, author_id) VALUES (?, ?, ?, ?)',
      [title, content, image_url, req.user.id]
    );
    res.json({ id: result.lastID, title, content, image_url, author_id: req.user.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  const { title, content, image_url } = req.body;
  try {
    const db = await getDbConnection();
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized to edit this post' });

    await db.run(
      'UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?',
      [title, content, image_url, req.params.id]
    );
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update post' });
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



