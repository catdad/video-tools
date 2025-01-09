const { ffprobe } = require('./ffmpeg.js');
const { get } = require('lodash');

const streamCmd = (stream, filepath) => `-v quiet -show_streams -select_streams ${stream} -print_format json "${filepath}"`
const formatCmd = (filepath) => `-v quiet "${filepath}" -print_format json -show_format`;

module.exports = async (filepath) => {
  const { stdout: video } = await ffprobe(streamCmd('v', filepath), { stdout: null, stderr: null });
  const { stdout: audio } = await ffprobe(streamCmd('a', filepath), { stdout: null, stderr: null });
  const { stdout: format } = await ffprobe(formatCmd(filepath), { stdout: null, stderr: null });

  return {
    audio: get(JSON.parse(audio), 'streams[0]', {}),
    video: get(JSON.parse(video), 'streams[0]', {}),
    format: get(JSON.parse(format), 'format', {}),
  };
};
