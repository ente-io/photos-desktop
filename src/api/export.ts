import { writeStream } from './../services/fs';
import { RootFS, RootPromiseFS } from '../services/fs';

export const exists = (path: string) => {
    return RootFS.existsSync(path);
};

export const checkExistsAndCreateDir = async (dirPath: string) => {
    if (!RootFS.existsSync(dirPath)) {
        await RootPromiseFS.mkdir(dirPath);
    }
};

export const saveStreamToDisk = async (
    filePath: string,
    fileStream: ReadableStream<Uint8Array>
) => {
    await writeStream(filePath, fileStream);
};

export const saveFileToDisk = async (path: string, fileData: string) => {
    await RootPromiseFS.writeFile(path, fileData);
};
