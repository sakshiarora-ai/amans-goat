import sharp from 'sharp';

await sharp(new URL('./assets/icon.svg', import.meta.url).pathname)
  .resize(1024, 1024)
  .png()
  .toFile(new URL('./assets/icon.png', import.meta.url).pathname);

