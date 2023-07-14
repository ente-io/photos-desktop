import { FILE_STREAM_CHUNK_SIZE } from '../config';
import path from 'path';
import { ElectronFile } from '../types';
import StreamZip from 'node-stream-zip';
import { Readable } from 'stream';
import { logError } from './logging';
import * as FS from 'fs';
import * as PromiseFS from 'fs/promises';

export * as RootFS from 'fs';
export * as RootPromiseFS from 'fs/promises';

// https://stackoverflow.com/a/63111390
export const getDirFilePaths = async (dirPath: string) => {
    if (!(await PromiseFS.stat(dirPath)).isDirectory()) {
        return [dirPath];
    }

    let filePaths: string[] = [];
    const fileDirents = await PromiseFS.readdir(dirPath, {
        withFileTypes: true,
    });

    for (const fileDirent of fileDirents) {
        const absolute = path.join(dirPath, fileDirent.name);
        filePaths = [...filePaths, ...(await getDirFilePaths(absolute))];
    }

    return filePaths;
};

export const getFileStream = async (filePath: string) => {
    const file = await PromiseFS.open(filePath, 'r');
    let offset = 0;
    const readableStream = new ReadableStream<Uint8Array>({
        async pull(controller) {
            try {
                const buff = new Uint8Array(FILE_STREAM_CHUNK_SIZE);
                // original types were not working correctly
                const { bytesRead } = await file.read(
                    buff,
                    offset,
                    FILE_STREAM_CHUNK_SIZE
                );
                offset += bytesRead;
                if (bytesRead === 0) {
                    controller.close();
                    await file.close();
                } else {
                    controller.enqueue(buff.slice(0, bytesRead));
                }
            } catch (e) {
                await file.close();
            }
        },
        async cancel() {
            await file.close();
        },
    });
    return readableStream;
};

export async function getElectronFile(filePath: string): Promise<ElectronFile> {
    const fileStats = (await PromiseFS.stat(filePath, {
        bigint: false,
    })) as FS.Stats;

    return {
        path: filePath.split(path.sep).join(path.posix.sep),
        name: path.basename(filePath),
        size: fileStats.size,
        lastModified: fileStats.mtime.valueOf(),
        stream: async () => {
            if (!FS.existsSync(filePath)) {
                throw new Error('electronFile does not exist');
            }
            return await getFileStream(filePath);
        },
        blob: async () => {
            if (!FS.existsSync(filePath)) {
                throw new Error('electronFile does not exist');
            }
            const blob = await PromiseFS.readFile(filePath);
            return new Blob([new Uint8Array(blob)]);
        },
        arrayBuffer: async () => {
            if (!FS.existsSync(filePath)) {
                throw new Error('electronFile does not exist');
            }
            const blob = await PromiseFS.readFile(filePath);
            return new Uint8Array(blob);
        },
    };
}

export const getValidPaths = (paths: string[]) => {
    if (!paths) {
        return [] as string[];
    }
    return paths.filter(async (path) => {
        try {
            await PromiseFS.stat(path).then((stat) => stat.isFile());
        } catch (e) {
            return false;
        }
    });
};

export const getZipFileStream = async (
    zip: StreamZip.StreamZipAsync,
    filePath: string
) => {
    const stream = await zip.stream(filePath);
    const done = {
        current: false,
    };
    const inProgress = {
        current: false,
    };
    let resolveObj: (value?: any) => void = null;
    let rejectObj: (reason?: any) => void = null;
    stream.on('readable', () => {
        try {
            if (resolveObj) {
                inProgress.current = true;
                const chunk = stream.read(FILE_STREAM_CHUNK_SIZE) as Buffer;
                if (chunk) {
                    resolveObj(new Uint8Array(chunk));
                    resolveObj = null;
                }
                inProgress.current = false;
            }
        } catch (e) {
            rejectObj(e);
        }
    });
    stream.on('end', () => {
        try {
            done.current = true;
            if (resolveObj && !inProgress.current) {
                resolveObj(null);
                resolveObj = null;
            }
        } catch (e) {
            rejectObj(e);
        }
    });
    stream.on('error', (e) => {
        try {
            done.current = true;
            if (rejectObj) {
                rejectObj(e);
                rejectObj = null;
            }
        } catch (e) {
            rejectObj(e);
        }
    });

    const readStreamData = async () => {
        return new Promise<Uint8Array>((resolve, reject) => {
            const chunk = stream.read(FILE_STREAM_CHUNK_SIZE) as Buffer;

            if (chunk || done.current) {
                resolve(chunk);
            } else {
                resolveObj = resolve;
                rejectObj = reject;
            }
        });
    };

    const readableStream = new ReadableStream<Uint8Array>({
        async pull(controller) {
            try {
                const data = await readStreamData();

                if (data) {
                    controller.enqueue(data);
                } else {
                    controller.close();
                }
            } catch (e) {
                logError(e, 'readableStream pull failed');
                controller.close();
            }
        },
    });
    return readableStream;
};

export async function isFolder(dirPath: string) {
    try {
        const stats = await PromiseFS.stat(dirPath);
        return stats.isDirectory();
    } catch (e) {
        let err = e;
        // if code is defined, it's an error from fs.stat
        if (typeof e.code !== 'undefined') {
            // ENOENT means the file does not exist
            if (e.code === 'ENOENT') {
                return false;
            }
            err = Error(`fs error code: ${e.code}`);
        }
        logError(err, 'isFolder failed');
        return false;
    }
}

export const convertBrowserStreamToNode = (
    fileStream: ReadableStream<Uint8Array>
) => {
    const reader = fileStream.getReader();
    const rs = new Readable();

    rs._read = async () => {
        const result = await reader.read();

        if (!result.done) {
            rs.push(Buffer.from(result.value));
        } else {
            rs.push(null);
            return;
        }
    };

    return rs;
};

export async function writeStream(
    filePath: string,
    fileStream: ReadableStream<Uint8Array>
) {
    const fileHandle = await PromiseFS.open(filePath, 'w');
    const writeable = fileHandle.createWriteStream();
    const readable = convertBrowserStreamToNode(fileStream);
    readable.pipe(writeable);
    await new Promise((resolve, reject) => {
        writeable.on('finish', resolve);
        writeable.on('error', reject);
    });
}

export async function readTextFile(filePath: string) {
    if (!FS.existsSync(filePath)) {
        throw new Error('File does not exist');
    }
    return await PromiseFS.readFile(filePath, 'utf-8');
}

export async function moveFile(
    sourcePath: string,
    destinationPath: string
): Promise<void> {
    if (!FS.existsSync(sourcePath)) {
        throw new Error('File does not exist');
    }
    if (FS.existsSync(destinationPath)) {
        throw new Error('Destination file already exists');
    }
    // check if destination folder exists
    const destinationFolder = path.dirname(destinationPath);
    if (!FS.existsSync(destinationFolder)) {
        await PromiseFS.mkdir(destinationFolder, { recursive: true });
    }
    await PromiseFS.rename(sourcePath, destinationPath);
}

export async function deleteFolder(folderPath: string): Promise<void> {
    if (!FS.existsSync(folderPath)) {
        return;
    }
    // check if folder is empty
    const files = await PromiseFS.readdir(folderPath);
    if (files.length > 0) {
        throw new Error('Folder is not empty');
    }
    await PromiseFS.rmdir(folderPath);
}

export async function rename(oldPath: string, newPath: string) {
    if (!FS.existsSync(oldPath)) {
        throw new Error('Path does not exist');
    }
    await PromiseFS.rename(oldPath, newPath);
}
