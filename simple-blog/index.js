const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up the blog posts route
app.get('/posts/:postId', (req, res) => {
  const postId = req.params.postId;
  const postPath = path.join(__dirname, 'views', 'posts', `${postId}.html`);
  
  // Check if the post exists
  if (fs.existsSync(postPath)) {
    res.sendFile(postPath);
  } else {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  }
});

// Home page route
app.get('/', (req, res) => {
  const postsDir = path.join(__dirname, 'views', 'posts');
  
  // Get all blog posts
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error loading blog posts');
    }
    
    // Filter for HTML files only
    const posts = files.filter(file => file.endsWith('.html'));
    
    // Generate an HTML list of posts
    let postList = '<ul>';
    posts.forEach(post => {
      const postId = post.replace('.html', '');
      postList += `<li><a href="/posts/${postId}">${postId.replace(/-/g, ' ')}</a></li>`;
    });
    postList += '</ul>';
    
    // Send the home page with the list of posts
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simple Blog</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
          <div class="container">
            <header>
              <h1>Simple Blog</h1>
            </header>
            <main>
              <h2>Blog Posts</h2>
              ${postList}
            </main>
            <footer>
              <p>&copy; ${new Date().getFullYear()} Simple Blog</p>
            </footer>
          </div>
        </body>
      </html>
    `);
  });
});

// 404 route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
