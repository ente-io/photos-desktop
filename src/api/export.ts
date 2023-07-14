import { existsSync, mkdir, writeFile } from '../services/sanitizedFS';
import { writeStream } from './../services/fs';

export const exists = (path: string) => {
    return existsSync(path);
};

export const checkExistsAndCreateDir = async (dirPath: string) => {
    if (!existsSync(dirPath)) {
        await mkdir(dirPath);
    }
};

export const saveStreamToDisk = async (
    filePath: string,
    fileStream: ReadableStream<Uint8Array>
) => {
    await writeStream(filePath, fileStream);
};

export const saveFileToDisk = async (path: string, fileData: string) => {
    await writeFile(path, fileData);
};
