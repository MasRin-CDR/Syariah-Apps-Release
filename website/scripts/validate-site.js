const fs = require('fs');
const path = require('path');

const root = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(`Validation failed: ${message}`);
    process.exitCode = 1;
  }
}

function json(file) {
  return JSON.parse(read(file));
}

const index = read('index.html');
const download = read(path.join('download', 'index.html'));
const admin = read(path.join('admin', 'statistics', 'index.html'));
const release = json('release.json');
const vercel = json('vercel.json');

const installerPath = path.join(root, 'downloads', 'SyariahAppSetup.exe');
const installer = fs.existsSync(installerPath) ? fs.statSync(installerPath) : null;

assert(fs.existsSync(installerPath), 'downloads/SyariahAppSetup.exe must exist');
assert(installer && installer.size === 257702767, 'installer size must match release metadata');
assert(release.artifacts.windows.url === '/downloads/SyariahAppSetup.exe', 'release.json must point to the official local download path');
assert(release.artifacts.windows.sha256 === '6469ba5658c020e553b8b2be9353f8dba065c62b74529f9d4a7a7cec07b6b4d2', 'release SHA-256 must match the installer');
assert(release.artifacts.android.publicDownload === false, 'Android public download must be disabled');

assert(index.includes('/downloads/SyariahAppSetup.exe'), 'homepage must link the Windows installer');
assert(download.includes('/downloads/SyariahAppSetup.exe'), '/download page must link the Windows installer');
assert(!index.includes('Android (.APK)'), 'homepage must not show an APK download button');
assert(!download.includes('Android (.APK)'), '/download page must not show an APK download button');
assert(index.includes('/_vercel/insights/script.js'), 'homepage must include Vercel Web Analytics script');
assert(download.includes('/_vercel/insights/script.js'), '/download page must include Vercel Web Analytics script');
assert(admin.includes('Chart.js') || admin.includes('chart.umd.min.js'), 'admin statistics must load Chart.js');

assert(fs.existsSync(path.join(root, 'api', 'track.js')), 'api/track.js must exist');
assert(fs.existsSync(path.join(root, 'api', 'stats.js')), 'api/stats.js must exist');
assert(vercel.cleanUrls === true, 'vercel.json must enable clean URLs');

if (process.exitCode) process.exit(process.exitCode);
console.log('Website distribution validation passed.');
