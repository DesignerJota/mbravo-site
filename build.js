import { execSync } from 'child_process';

const isCloudflare = process.env.CF_PAGES === '1';

try {
  if (isCloudflare) {
    console.log('Building for Cloudflare Pages (Client only)...');
    execSync('npm run build:client', { stdio: 'inherit' });
  } else {
    console.log('Building for Railway (Client & Server)...');
    execSync('npm run build:client', { stdio: 'inherit' });
    execSync('npm run build:server', { stdio: 'inherit' });
  }
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
