import fs from 'fs';

['BacktestPanel', 'TimeMachinePanel', 'DecidePanel'].forEach(name => {
  const code = fs.readFileSync('C:/Users/Anirudh/.gemini/antigravity/brain/5abefc25-ce1e-4bf1-867a-d9ec32d001b0/scratch/extracted_futura/components_console_' + name + '.jsx', 'utf-8');
  console.log('=== ' + name + ' ===');
  const importRegex = /\/\* harmony import \*\/ var (\w+) = __webpack_require__\(\/\*! ([^*]+) \*\/\s*"([^"]+)"\);/g;
  let m;
  while ((m = importRegex.exec(code)) !== null) {
    console.log(m[1], '-->', m[2], '-->', m[3]);
  }
});
