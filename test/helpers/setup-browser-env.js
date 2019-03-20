require('@babel/register')({
    ignore: ['node_modules/*', 'test/*', '!test/source/*']
});

import browserEnv from 'browser-env';
browserEnv(['window', 'document', 'HTMLElement']);