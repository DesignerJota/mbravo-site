import sharp from 'sharp';
import fs from 'fs';
import https from 'https';
import path from 'path';

const urls = [
  'https://i.ibb.co/KppF2KLq/Background.png',
  'https://i.ibb.co/Z6z6D2W9/Background04.png',
  'https://i.ibb.co/JjKC14LX/Backgrounde03.png',
  'https://i.ibb.co/nK7Y2Rc/Background06.png'
];

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function processAll() {
  for (let i = 0; i < urls.length; i++) {
    const num = i + 1;
    console.log(`Downloading background ${num}...`);
    const buffer = await download(urls[i]);
    
    const mobilePath = `./public/hero-bg-${num}-mobile.webp`;
    const desktopPath = `./public/hero-bg-${num}-desktop.webp`;

    await sharp(buffer)
      .resize(750)
      .webp({ quality: 80, effort: 6 })
      .toFile(mobilePath);

    await sharp(buffer)
      .resize(1920)
      .webp({ quality: 82, effort: 6 })
      .toFile(desktopPath);

    const mStats = fs.statSync(mobilePath);
    const dStats = fs.statSync(desktopPath);
    console.log(`Background ${num}: Mobile WebP = ${Math.round(mStats.size / 1024)}KB | Desktop WebP = ${Math.round(dStats.size / 1024)}KB`);
  }
}

processAll().catch(console.error);
