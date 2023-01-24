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
        '0',
        '-f',
        'mp4',
        'pipe:1',
    ]);

    // get video duration from ffmpeg
    const durationRef = { duration: 0 };
    ffmpeg.stderr.on('data', (data) => {
        const str = data.toString();
        const match = str.match(/Duration: (\d{2}):(\d{2}):(\d{2})/);
        if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            const seconds = parseInt(match[3], 10);
            const duration = hours * 3600 + minutes * 60 + seconds;
            console.log('duration', duration);
            durationRef.duration = duration;
        }
    });

    inputFile.pipe(ffmpeg.stdin);
    return { stream: ffmpeg.stdout, durationRef };
}
