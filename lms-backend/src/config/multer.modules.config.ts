import { diskStorage } from 'multer';
import { extname } from 'path';

const allowedMime = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/x-msvideo',
  'video/quicktime',
];

export const moduleMulterConfig = {
  storage: diskStorage({
    destination: './uploads/modules',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `module-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
    if (!allowedMime.includes(file.mimetype)) {
      return callback(
        new Error('Only ppt, pptx, pdf, or video files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB to support videos
  },
};
