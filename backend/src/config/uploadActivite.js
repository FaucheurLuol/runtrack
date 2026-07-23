const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits:  { fileSize: 20 * 1024 * 1024 }, // 20MB max (fichiers .fit/.gpx restent petits)
    fileFilter: (req, file, cb) => {
        const extensionsValides = ['.fit', '.gpx'];
        const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
        if (extensionsValides.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Format non supporté. Utilisez .fit ou .gpx'));
        }
    },
});

module.exports = upload;