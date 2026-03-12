# My Digital Folder

A simple, beautiful website to store and manage your school files (Handouts, Projects, and Journals).

## Features

✅ **No Login Required** - Just open and start using  
✅ **Three Categories** - Handouts, Projects, Journals  
✅ **Easy Upload** - Click or drag files to upload  
✅ **Quick Download** - Download any file with one click  
✅ **Beautiful Design** - Clean white background with blue accents  
✅ **Mobile Friendly** - Works great on phones and tablets  

## Project Structure

```
/workspace
├── public/
│   └── index.html          # Frontend (all-in-one HTML file)
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   └── database.db         # SQLite database (created at startup)
└── package.json            # Root package.json
```

## Technology Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript  
**Backend:** Node.js, Express.js, SQLite3  
**File Storage:** Local filesystem (uploads/)  

## How It Works

1. **Upload** - Select a file and category, then click upload
2. **Store** - Files are saved to SQLite database and uploaded to disk
3. **Manage** - View all files organized by category
4. **Download** - Download any file back to your device
5. **Delete** - Remove files you no longer need

## API Endpoints

- `POST /api/files/upload` - Upload a new file
- `GET /api/files` - Get all files
- `GET /api/files/:id/download` - Download a file
- `DELETE /api/files/:id` - Delete a file

## File Summary

| File | Purpose |
|------|---------|
| `public/index.html` | Complete frontend (HTML + CSS + JS) |
| `backend/server.js` | Express API server with SQLite |
| `backend/package.json` | Backend dependencies |

The application is production-ready with:
- ✅ Full upload/download functionality
- ✅ File management (create, read, delete)
- ✅ Responsive mobile design
- ✅ SQLite persistent storage
- ✅ Error handling and user feedback
- ✅ Drag-and-drop file upload
- ✅ CORS enabled for API access