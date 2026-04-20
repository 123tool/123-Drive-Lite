const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const app = express();
const PORT = 8080;

// Lokasi storage: Kita arahkan ke internal storage HP
// Pastikan sudah jalanin termux-setup-storage
const STORAGE_PATH = '/sdcard'; 

app.use(express.static('public'));
app.use(express.json());

// Konfigurasi Multer untuk Upload Ngebut
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const targetPath = req.query.path || '';
        cb(null, path.join(STORAGE_PATH, targetPath));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Fitur 1: List File & Folder
app.get('/api/files', (req, res) => {
    const currentPath = req.query.path || '';
    const fullPath = path.join(STORAGE_PATH, currentPath);

    if (!fs.existsSync(fullPath)) return res.status(404).send('Folder tidak ditemukan');

    const files = fs.readdirSync(fullPath).map(file => {
        const stats = fs.statSync(path.join(fullPath, file));
        return {
            name: file,
            isFolder: stats.isDirectory(),
            size: stats.size,
            mtime: stats.mtime
        };
    });
    res.json(files);
});

// Fitur 2: Download & Streaming
app.get('/api/download', (req, res) => {
    const filePath = req.query.path;
    const fullPath = path.join(STORAGE_PATH, filePath);
    
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
        res.download(fullPath);
    } else {
        res.status(404).send('File tidak ditemukan');
    }
});

// Fitur 3: Upload File
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('Tidak ada file yang diunggah');
    res.json({ message: 'Upload berhasil!', file: req.file.originalname });
});

// Fitur 4: Delete File/Folder
app.delete('/api/delete', (req, res) => {
    const targetPath = req.query.path;
    const fullPath = path.join(STORAGE_PATH, targetPath);

    try {
        if (fs.lstatSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(fullPath);
        }
        res.json({ message: 'Berhasil dihapus' });
    } catch (err) {
        res.status(500).send('Gagal menghapus: ' + err.message);
    }
});

// Fitur 5 & 6: Akses Localhost & Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ██╗██████╗ ██████╗     ██████╗ ██████╗ ██╗██╗   ██╗███████╗
    ███║╚════██╗╚════██╗    ██╔══██╗██╔══██╗██║██║   ██║██╔════╝
    ╚██║ █████╔╝ █████╔╝    ██║  ██║██████╔╝██║██║   ██║█████╗  
     ██║██╔═══╝  ╚═══██╗    ██║  ██║██╔══██╗██║╚██╗ ██╔╝██╔══╝  
     ██║███████╗██████╔╝    ██████╔╝██║  ██║██║ ╚████╔╝ ███████╗
     ╚═╝╚══════╝╚═════╝     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
    ------------------------------------------------------------
    123 Drive Lite by SPY-E & 123Tool
    Status: RUNNING
    Akses: http://localhost:${PORT} atau http://[IP-HP-KAMU]:${PORT}
    ------------------------------------------------------------
    `);
});
