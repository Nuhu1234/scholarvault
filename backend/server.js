const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

db.run(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER
  )
`);

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { category } = req.body;
  const validCategories = ['handouts', 'projects', 'journals'];

  if (!category || !validCategories.includes(category)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Invalid category' });
  }

  const fileSize = req.file.size;

  db.run(
    'INSERT INTO files (original_name, stored_name, category, file_size) VALUES (?, ?, ?, ?)',
    [req.file.originalname, req.file.filename, category, fileSize],
    function(err) {
      if (err) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({
        id: this.lastID,
        original_name: req.file.originalname,
        stored_name: req.file.filename,
        category: category,
        file_size: fileSize
      });
    }
  );
});

app.get('/api/files', (req, res) => {
  db.all('SELECT id, original_name, category, created_at, file_size FROM files ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

app.get('/api/files/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['handouts', 'projects', 'journals'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  db.all('SELECT id, original_name, category, created_at, file_size FROM files WHERE category = ? ORDER BY created_at DESC', [category], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows || []);
  });
});

app.get('/api/download/:fileId', (req, res) => {
  const { fileId } = req.params;

  db.get('SELECT original_name, stored_name FROM files WHERE id = ?', [fileId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, row.stored_name);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, row.original_name);
  });
});

app.delete('/api/files/:fileId', (req, res) => {
  const { fileId } = req.params;

  db.get('SELECT stored_name FROM files WHERE id = ?', [fileId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, row.stored_name);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.run('DELETE FROM files WHERE id = ?', [fileId], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});