const PROD_HOST_URL: string = 'ente://app';
const RENDERER_OUTPUT_DIR: string = './ui/out';
const LOG_FILENAME = 'ente.log';
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB

const FILE_STREAM_CHUNK_SIZE: number = 4 * 1024 * 1024;

const WAIT_TIME_FOR_READY_TO_SHOW = 4000; // 4s in ms

export {
    PROD_HOST_URL,
    RENDERER_OUTPUT_DIR,
    FILE_STREAM_CHUNK_SIZE,
    LOG_FILENAME,
    MAX_LOG_SIZE,
    WAIT_TIME_FOR_READY_TO_SHOW,
};
