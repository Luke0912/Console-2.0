import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    },
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
};

// Multer upload instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});

// Helper to delete file
export const deleteFile = (filename: string): void => {
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// Helper to get file URL
export const getFileUrl = (filename: string, req: any): string => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/products/${filename}`;
};

// Helper to extract filename from URL
export const getFilenameFromUrl = (url: string): string | null => {
    const match = url.match(/\/uploads\/products\/(.+)$/);
    return match ? match[1] : null;
};
