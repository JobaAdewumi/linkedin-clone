import { from, Observable, of, switchMap } from 'rxjs';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

import {fileTypeFromFile} from 'file-type';
import fs from 'node:fs';
// const fs = require('fs');
// const FileType = require('file-type');
// const fileTypeFromFile = require('file-type');


import path = require('path');

type validFileExtension = 'png' | 'jpg';
type validMimeType = 'image/png' | 'image/jpeg';

const validFileExtensions: validFileExtension[] = ['png', 'jpg'];
const validMimeTypes: validMimeType[] = ['image/png', 'image/jpeg'];

export const saveImageToStorage = {
  storage: diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;

      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMineTypes: validMimeType[] = validMimeTypes;
    allowedMineTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
};

// export const isFileExtensionSafe = (
//   fullFilePath: string,
// ): Observable<boolean> => {
//   return from(fileTypeFromFile(fullFilePath)).pipe(
//     switchMap(
//       (fileExtensionAndMimeType: {
//         ext: validFileExtension;
//         mime: validMimeType;
//       }) => {
//         if (!fileExtensionAndMimeType) return of(false);

//         const isFileTypeLegit = validFileExtensions.includes(
//           fileExtensionAndMimeType.ext,
//         );
//         const isMimeTypeLegit = validMimeTypes.includes(
//           fileExtensionAndMimeType.mime,
//         );
//         const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
//         return of(isFileLegit);
//       },
//     ),
//   );
// };

// export const removeFile = (fullFilePath: string): void => {
//   try {
//     fs.unlinkSync(fullFilePath);
//   } catch (err) {
//     console.error(err);
//   }
// };
