const { ffprobe } = require('./ffmpeg.js');

const cmd = (stream, filepath) => `-show_streams -select_streams ${stream} -print_format json "${filepath}"`

module.exports = async (filepath) => {
  const { stdout: video } = await ffprobe(cmd('v', filepath), { stdout: null, stderr: null });
  const { stdout: audio } = await ffprobe(cmd('a', filepath), { stdout: null, stderr: null });

  return {
    audio: JSON.parse(audio).streams[0],
    video: JSON.parse(video).streams[0]
  };
};
