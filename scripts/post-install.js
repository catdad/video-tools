/* jshint node: true */
/* global Promise */

// script copied from localcasst
// https://github.com/catdad/localcast/blob/master/scripts/post-install.js

var os = require('os');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');

var mkdirp = require('mkdirp');
var unzip = require('unzip');

var destination = 'bin/ffmpeg';

mkdirp.sync(destination);

var cache = (function (platform) {
    if (platform === 'darwin') {
        return 'bin/darwin-ffmpeg.zip';
    }

    if (platform === 'win32') {
        return 'bin/win-ffmpeg.zip';
    }

    return null;
}(os.platform()));

var url = (function (platform) {
    if (platform === 'darwin') {
        return 'https://ffmpeg.zeranoe.com/builds/macos64/static/ffmpeg-4.0-macos64-static.zip';
    }

    if (platform === 'win32') {
        return 'https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-4.0-win64-static.zip';
    }

    return null;
}(os.platform()));

function get(url) {
    var httpx = /^https/.test(url) ? https : http;

    return httpx.get(url);
}

function writeFile(rs, ws) {
    return new Promise(function (resolve, reject) {
        rs.pipe(ws);

        rs.on('error', reject);
        ws.on('error', reject);
        ws.on('finish', resolve);
    });
}

function zipStream() {
    return new Promise(function (resolve, reject) {
        var stream = fs.createReadStream(cache);

        stream.on('open', function () {
            resolve(stream);
        });

        stream.on('error', function (err) {
            reject(err);
        });
    });
}

function requestStream(url) {
    console.log('downloading from', url);

    return new Promise(function (resolve, reject) {
        // cache on the filesystem
        try {
            get(url).on('response', resolve).on('error', reject);
        } catch(e) {
            reject(e);
        }
    });
}

function cacheArchive(stream) {
    return writeFile(stream, fs.createWriteStream(cache)).then(function () {
        return zipStream();
    });
}

function getArchive(url) {
    return zipStream().catch(function(err) {
        if (err.code === 'ENOENT') {
            return requestStream(url).then(cacheArchive);
        }

        return Promise.reject(err);
    });
}

function unzipArchive(stream) {
    return new Promise(function (resolve, reject) {
        var prom = Promise.resolve();

        function done(err) {
            prom.then(function () {
                if (err) {
                    return reject(err);
                }

                return resolve();
            }).catch(function (promErr) {
                if (err) {
                    return reject(err);
                }

                return reject(promErr);
            });
        }

        stream.pipe(unzip.Parse())
        .on('entry', function (entry) {
            if (entry.type !== 'File') {
                return entry.autodrain();
            }

            if (!/\/bin\/[^/]+$/.test(entry.path)) {
                return entry.autodrain();
            }

            var name = path.basename(entry.path);
            var filepath = path.resolve(destination, name);

            console.log('  writing', filepath);

            prom = prom.then(function () {
                return writeFile(entry, fs.createWriteStream(filepath));
            });
        })
        .on('error', done)
        .on('finish', done)
        .on('end', done);
    });
}

if (url) {
    getArchive(url)
    .then(unzipArchive)
    .then(function () {
        console.log('ffmpeg installed successfully');
    })
    .catch(function (err) {
        console.error(err);
        process.exitCode = 1;
    });
} else {
    console.log('ffmpeg download is not implemented for this operating system');
    console.log('download the ffmpeg and ffprobe binaries and place them in', destination);
}
