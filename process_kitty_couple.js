const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = `C:\\Users\\myin\\.gemini\\antigravity-ide\\brain\\3079eda9-b5c3-45c7-9707-75f4c1b78bc3\\hello_kitty_couple_1785303975971.png`;
const outputPath = path.join(__dirname, 'hello_kitty_couple.png');

const buffer = fs.readFileSync(inputPath);
const png = PNG.sync.read(buffer);

for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const idx = (png.width * y + x) << 2;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    
    // If near white background pixel (r, g, b > 230), make it transparent
    if (r > 230 && g > 230 && b > 230) {
      png.data[idx + 3] = 0; // Alpha = 0
    }
  }
}

const options = { colorType: 6 };
const bufferOut = PNG.sync.write(png, options);
fs.writeFileSync(outputPath, bufferOut);
console.log('Successfully saved transparent Hello Kitty couple image!');
