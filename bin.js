#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
var argv = require('yargs')
.commandDir('commands')
.demandCommand()
.help()
.argv;
