#!/usr/bin/env node

var argv = require('yargs')
.commandDir('commands')
.demandCommand()
.help()
.argv;
