const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        let prefix = 'file-';
        
        if (file.mimetype.startsWith('image/')) prefix = 'product-';
        else if (file.mimetype.startsWith('video/')) prefix = 'video-';
        else if (file.mimetype === 'application/pdf') prefix = 'pdf-';
        
        cb(null, prefix + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
    const allowedPdfTypes = /pdf/;
    
    const ext = path.extname(file.originalname).toLowerCase();
    const extname = ext.replace('.', '');
    
    const isImage = allowedImageTypes.test(extname) && file.mimetype.startsWith('image/');
    const isVideo = allowedVideoTypes.test(extname) && file.mimetype.startsWith('video/');
    const isPdf = allowedPdfTypes.test(extname) && file.mimetype === 'application/pdf';

    if (isImage || isVideo || isPdf) {
        return cb(null, true);
    } else {
        cb(new Error('Seuls les fichiers image, vidéo et PDF sont autorisés'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max (pour vidéos)
    },
    fileFilter: fileFilter
});

module.exports = upload;

