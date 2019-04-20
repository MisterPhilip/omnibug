import browserEnv from 'browser-env';
const chrome = require('sinon-chrome/extensions');
browserEnv(['window', 'document', 'HTMLElement']);
global.chrome = chrome;