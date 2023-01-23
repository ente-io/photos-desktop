import { spawn } from 'child_process';
import pathToFfmpeg from 'ffmpeg-static';

function getFFmpegStaticPath() {
    return pathToFfmpeg.replace('app.asar', 'app.asar.unpacked');
}

export function liveTranscodeVideoForStreaming(
    inputFile: NodeJS.ReadableStream
) {
    const ffmpeg = spawn(getFFmpegStaticPath(), [
        '-i',
        'pipe:0',
        '-f',
        'lavfi',
        '-i',
        'anullsrc=cl=mono',
        '-preset',
        'ultrafast',
        '-movflags',
        'frag_keyframe+empty_moov+default_base_moof',
        '-g',
        '52',
        '-acodec',
        'aac',
        '-shortest',
        '-vcodec',
        'libx264',
        '-filter:v',
        'scale=720:-2',
        '-crf',
        '28',
        '-f',
        'mp4',
        'pipe:1',
    ]);

    inputFile.pipe(ffmpeg.stdin);
    return ffmpeg.stdout;
}
