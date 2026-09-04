import spawn from 'cross-spawn-cb';
import { safeRm } from 'fs-remove-compat';
import getopts from 'getopts-compat';
import { link, unlink } from 'link-unlink';
import path from 'path';
import Queue from 'queue-cb';
import resolveBin from 'resolve-bin-sync';
import type { CommandCallback, CommandOptions } from 'tsds-lib';
import { installPath } from 'tsds-lib';
import { mochaBin } from 'tsds-mocha';
import url from 'url';

const __dirname = path.dirname(typeof __filename === 'undefined' ? url.fileURLToPath(import.meta.url) : __filename);

const config = path.join(__dirname, '..', '..', '..', 'assets', 'c8rc.json');

export default function c8(args: string[], options: CommandOptions, callback: CommandCallback) {
  const cwd: string = (options.cwd as string) || process.cwd();
  const opts = getopts(args, { alias: { 'dry-run': 'd' }, boolean: ['dry-run'] });
  const filteredArgs = args.filter((arg) => arg !== '--dry-run' && arg !== '-d');

  if (opts['dry-run']) {
    console.log('Dry-run: would run coverage tests with c8');
    return callback();
  }

  link(cwd, installPath(options), (err, restore) => {
    if (err) return callback(err);
    if (!restore) return callback(new Error('link did not return restore path'));

    try {
      const c8 = resolveBin('c8');
      const mocha = resolveBin(mochaBin, mochaBin);
      const loader = resolveBin('ts-swc-loaders', 'ts-swc');

      const { _, ...innerOpts } = getopts(filteredArgs, { stopEarly: true, alias: { config: 'c' } });
      const spawnArgs = [c8];
      if (!innerOpts.config) Array.prototype.push.apply(spawnArgs, ['--config', config]);
      // mocha 3.x only knows --watch-extensions; 10 and 12 only know --extension.
      Array.prototype.push.apply(spawnArgs, mochaBin === 'mocha-compat-3' ? [mocha, '--watch-extensions', 'ts,tsx'] : [mocha, '--extension', 'ts,tsx']);
      Array.prototype.push.apply(spawnArgs, filteredArgs);
      if (_.length === 0) Array.prototype.push.apply(spawnArgs, [['test/**/*.test.*']]);
      const dest = path.join(cwd, 'coverage');

      const queue = new Queue(1);
      queue.defer((cb) => safeRm(dest, (err) => cb(err)));
      queue.defer(spawn.bind(null, loader, spawnArgs, options));
      queue.await((err) => unlink(restore, callback.bind(null, err)));
    } catch (err) {
      console.log((err as Error).message);
      return callback(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
