#!/usr/bin/env node

import CCM from '../@core/ccm/ccm';
import GitLog from '../commands/gitlog';
import Version from '../commands/version';

const args = process.argv.slice(2);

new CCM([new Version(), new GitLog()]).execute(args);
