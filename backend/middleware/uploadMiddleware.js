// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// const uploadDir = './uploads/profileImage';
// if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (_, __, cb) => cb(null, uploadDir),
//   filename: (_, file, cb) => {
//     const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, `profile-${suffix}${path.extname(file.originalname)}`);
//   },
// });

// const fileFilter = (_, file, cb) => {
//   const allowed = ['image/jpg','image/jpeg', 'image/png', 'image/webp','application/pdf'];
//   cb(null, allowed.includes(file.mimetype));
// };

// const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
// export default upload;



import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const uploadDir = './uploads/profileImage';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'mtl-booking',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
  },
});

const upload = multer({ storage });
export default upload;