import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { upload, getFileUrl } from '../utils/fileUpload';
import { AppError } from '../utils/errors';

const router = Router();

/**
 * Upload single image
 * POST /api/upload/image
 */
router.post(
    '/image',
    authenticate,
    upload.single('image'),
    (req: Request, res: Response) => {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const fileUrl = getFileUrl(req.file.filename, req);

        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype,
            },
        });
    }
);

/**
 * Upload multiple images
 * POST /api/upload/images
 */
router.post(
    '/images',
    authenticate,
    upload.array('images', 10), // Max 10 images
    (req: Request, res: Response) => {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            throw new AppError('No files uploaded', 400);
        }

        const files = req.files as Express.Multer.File[];
        const uploadedFiles = files.map((file) => ({
            filename: file.filename,
            url: getFileUrl(file.filename, req),
            size: file.size,
            mimetype: file.mimetype,
        }));

        res.json({
            success: true,
            data: uploadedFiles,
        });
    }
);

export default router;
