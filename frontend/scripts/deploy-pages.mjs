import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const blake3Wasm = require('/home/cantroll/.npm/_npx/32026684e21afda6/node_modules/blake3-wasm');

const ACCOUNT_ID = '7344e0954eba9e0cd33d2d7e3509cf2f';
const PROJECT_NAME = 'kyamatu-frontend';
const TOKEN = 'cfoat__MaRPrv1olfq2RbFpM6dGq18kYihzvg21GK8VOzRPP4.GBA9VZvxjB1j8mAT8VcFkKGKK8vvZs1vnV-MhFTh45M';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function curl(url, options = {}) {
  const method = options.method || 'GET';
  let cmd = `curl -s -X ${method} "${url}"`;
  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      cmd += ` -H "${k}: ${v}"`;
    }
  }
  let tmpFile = null;
  if (options.body) {
    tmpFile = `/tmp/curl_body_${Date.now()}_${Math.random().toString(36).slice(2)}.json`;
    fs.writeFileSync(tmpFile, typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    cmd += ` --data-binary "@${tmpFile}"`;
  }
  try {
    const out = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
    return JSON.parse(out);
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (_) {}
    }
  }
}

async function main() {
  console.log('🚀 Starting Cloudflare Pages deployment for:', PROJECT_NAME);
  
  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory not found. Please run npm run build first.');
  }

  // 1. Get JWT upload token
  console.log('🔑 Fetching upload token...');
  const tokenRes = curl(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/upload-token`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  if (!tokenRes.success || !tokenRes.result?.jwt) {
    throw new Error(`Failed to get upload token: ${JSON.stringify(tokenRes)}`);
  }
  const jwt = tokenRes.result.jwt;
  console.log('✅ Upload token acquired.');

  // 2. Scan and hash all files
  const fileEntries = [];
  const manifest = {};

  function scan(dir, base = '') {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const relPath = path.join(base, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath, relPath);
      } else {
        const contents = fs.readFileSync(fullPath);
        const base64Contents = contents.toString('base64');
        const ext = path.extname(fullPath);
        const extNoDot = ext ? ext.substring(1) : '';
        const hash = blake3Wasm.hash(base64Contents + extNoDot).toString('hex').slice(0, 32);
        const contentType = MIME_TYPES[ext.toLowerCase()] || 'application/octet-stream';
        const routePath = '/' + relPath.replace(/\\/g, '/');

        manifest[routePath] = hash;
        fileEntries.push({
          routePath,
          hash,
          fullPath,
          base64Contents,
          contentType,
          size: stat.size
        });
      }
    }
  }

  scan(distDir);
  console.log(`📁 Found ${fileEntries.length} files to deploy.`);

  // 3. Check missing hashes
  const allHashes = fileEntries.map(f => f.hash);
  const checkMissingRes = curl('https://api.cloudflare.com/client/v4/pages/assets/check-missing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    },
    body: { hashes: allHashes }
  });

  const missingHashes = checkMissingRes.result || [];
  console.log(`🔍 Missing hashes to upload: ${missingHashes.length} / ${allHashes.length}`);

  // 4. Upload missing files
  if (missingHashes.length > 0) {
    const toUpload = fileEntries.filter(f => missingHashes.includes(f.hash));
    const uploadPayload = toUpload.map(f => ({
      key: f.hash,
      value: f.base64Contents,
      metadata: { contentType: f.contentType },
      base64: true
    }));

    console.log(`⬆️ Uploading ${uploadPayload.length} file(s)...`);
    const uploadRes = curl('https://api.cloudflare.com/client/v4/pages/assets/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
      },
      body: uploadPayload
    });

    if (!uploadRes.success) {
      throw new Error(`Upload failed: ${JSON.stringify(uploadRes)}`);
    }
    console.log('✅ Files uploaded successfully.');
  }

  // 5. Upsert hashes
  console.log('💾 Upserting hashes...');
  const upsertRes = curl('https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`
    },
    body: { hashes: allHashes }
  });

  if (!upsertRes.success) {
    throw new Error(`Upsert hashes failed: ${JSON.stringify(upsertRes)}`);
  }
  console.log('✅ Hashes confirmed.');

  // 6. Create deployment
  console.log('🚀 Finalizing deployment...');
  const manifestJson = JSON.stringify(manifest);
  const tmpManifestFile = `/tmp/manifest_${Date.now()}.json`;
  fs.writeFileSync(tmpManifestFile, manifestJson);

  let commitHash = 'latest';
  try {
    commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch (_) {}

  const deployCmd = `curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments" \
    -H "Authorization: Bearer ${TOKEN}" \
    -F "manifest=<${tmpManifestFile}" \
    -F "branch=master" \
    -F "commit_dirty=true" \
    -F "commit_hash=${commitHash}" \
    -F "commit_message=Live release from Antigravity"`;

  const deployOutput = execSync(deployCmd, { encoding: 'utf-8' });
  try { fs.unlinkSync(tmpManifestFile); } catch (_) {}

  const deployRes = JSON.parse(deployOutput);
  if (!deployRes.success) {
    throw new Error(`Deployment creation failed: ${deployOutput}`);
  }

  const deployUrl = deployRes.result?.url || `https://${PROJECT_NAME}.pages.dev`;
  console.log('🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('🌐 Preview URL:', deployUrl);
  console.log('🌟 Production URL: https://kyamatu-frontend.pages.dev');
}

main().catch(err => {
  console.error('❌ Error during deploy:', err);
  process.exit(1);
});
