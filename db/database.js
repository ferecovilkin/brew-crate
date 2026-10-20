const path = require('path');
const { execFileSync } = require('child_process');

const DB_PATH = process.env.BREWCRATE_DB || path.join(__dirname, 'brewcrate.db');

// better-sqlite3 is a native module: it needs a compiled `.node` binary that
// matches the current Node version. On most machines `npm install` fetches a
// prebuilt one automatically. On some (e.g. a locked-down npm that blocks
// install scripts, like Kali's default, or an unusual Node/ABI combo) that step
// is skipped and the app would crash with "Could not locate the bindings file".
//
// To make sure *nobody* has to debug that, we heal it here: if the native
// binary is missing, fetch/build it once — automatically — then carry on.
// better-sqlite3 loads its native binary lazily — `require()` succeeds, but the
// binary is only touched when you construct `new Database()`. So we probe with
// an in-memory database to surface (and heal) a missing binary up front.
function probe(Ctor) {
  const probeDb = new Ctor(':memory:');
  probeDb.close();
  return Ctor;
}

function loadDriver() {
  try {
    return probe(require('better-sqlite3'));
  } catch (err) {
    const message = String((err && err.message) || err);
    const nativeBindingMissing =
      /bindings file|better_sqlite3\.node|Could not locate|NODE_MODULE_VERSION|invalid ELF/i.test(message);
    if (!nativeBindingMissing) throw err;

    console.warn('[BrewCrate] Preparing the database engine (one-time setup)…');

    let pkgDir;
    try {
      pkgDir = path.dirname(require.resolve('better-sqlite3/package.json'));
    } catch {
      throw err; // dependency not installed at all — nothing we can fix here
    }

    const run = (bin, args) =>
      execFileSync(process.execPath, [bin, ...args], {
        cwd: pkgDir,
        stdio: 'ignore',
        timeout: 5 * 60 * 1000,
      });

    const attempts = [];

    // 1) Download the official prebuilt binary. No compiler and no npm install
    //    script involved, so this works even when npm blocks install scripts.
    try {
      const prebuild = require.resolve('prebuild-install/bin.js');
      attempts.push(() => run(prebuild, []));
    } catch {
      /* prebuild-install not present; skip */
    }

    // 2) Fall back to compiling from source (needs python3 + a C/C++ toolchain).
    try {
      const nodeGyp = require.resolve('node-gyp/bin/node-gyp.js');
      attempts.push(() => run(nodeGyp, ['rebuild', '--release']));
    } catch {
      /* node-gyp not resolvable; skip */
    }

    for (const attempt of attempts) {
      try {
        attempt();
        delete require.cache[require.resolve('better-sqlite3')];
        const Database = probe(require('better-sqlite3'));
        console.warn('[BrewCrate] Database engine ready.');
        return Database;
      } catch {
        /* try the next strategy */
      }
    }

    console.error(
      [
        '',
        '[BrewCrate] Could not set up the SQLite engine automatically.',
        '',
        'This usually means npm skipped the native build for better-sqlite3.',
        'Fix it with one of these, then run `npm start` again:',
        '',
        '  • npm rebuild better-sqlite3',
        '  • apt-get install -y python3 make g++   (then: npm rebuild better-sqlite3)',
        '',
        'Or skip native builds entirely and run it in a container:',
        '',
        '  • docker compose up --build',
        '',
      ].join('\n')
    );
    throw err;
  }
}

const Database = loadDriver();

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
module.exports.DB_PATH = DB_PATH;
