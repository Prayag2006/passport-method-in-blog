const mongoose = require('mongoose');
const { connectDB } = require('./database');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcrypt');

async function seed() {
  await connectDB();

  try {
    // Clear existing data
    await Post.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const username = 'admin_user';
    const email = 'admin@example.com';
    const password = 'password123';

    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();
    const authorId = savedUser._id;

    const posts = [
      {
        title: 'The Future of Web Development',
        content: 'As we step into 2026, web development has shifted dramatically towards AI-assisted coding, Edge computing, and seamless WebGL experiences. Gone are the days of manually tweaking thousands of lines of CSS; today, design systems and AI pair programmers help us achieve visual excellence faster than ever. The modern web is more vibrant, dynamic, and accessible, driven by new CSS features and highly optimized JavaScript frameworks.',
        image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Mastering React Server Components',
        content: 'Server Components are reshaping how we build React applications. By executing code exclusively on the server, we can significantly reduce the JavaScript bundle size shipped to the client, while seamlessly querying databases and accessing server-side APIs. This paradigm shift introduces a new mental model for state management and data fetching, leading to highly performant and SEO-friendly applications without the complexity of traditional SSR setups.',
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Designing Beautiful Interfaces',
        content: 'Visual aesthetics matter. A premium interface built with glassmorphism, subtle micro-animations, and vibrant gradients can transform a simple tool into an engaging experience. Typography choices like Inter or Outfit add a modern touch, while carefully curated dark modes reduce eye strain and provide a sleek look. Designing for the web is an art of balancing performance with visual delight.',
        image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ];

    // Add author_id to each post
    const postsWithAuthor = posts.map(post => ({
      ...post,
      author_id: authorId
    }));

    await Post.insertMany(postsWithAuthor);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seed().catch(console.error);



