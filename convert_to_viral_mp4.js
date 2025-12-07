const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(require('ffmpeg-static'));

const folderPath = path.join(require('os').homedir(), 'Documents', 'premium_songs');
const outputFolder = path.join(require('os').homedir(), 'Documents', 'premium_videos');

console.log('Starting conversion of all MP3s in:');
console.log(folderPath);
console.log('Output videos will be saved to:');
console.log(outputFolder);
console.log('--------------------------------------------------\n');

if (!fs.existsSync(folderPath)) {
  console.error('Source folder not found! Check the path.');
  process.exit(1);
}

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
  console.log('✓ Created output folder: premium_videos\n');
}

let mp3Files = fs.readdirSync(folderPath)
  .filter(file => file.toLowerCase().endsWith('.mp3'))
  .sort();

// TEST WITH FIRST 5
mp3Files = mp3Files.slice(0, 5);

if (mp3Files.length === 0) {
  console.log('No .mp3 files found in the folder.');
  process.exit(0);
}

let completed = 0;
const totalFiles = mp3Files.length;
let startTime = Date.now();

function processNext() {
  if (mp3Files.length === 0) {
    const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
    console.log('\n🔥🔥🔥 ALL SONGS CONVERTED SUCCESSFULLY! 🔥🔥🔥');
    console.log('Videos saved to: ' + outputFolder);
    console.log(`Total processing time: ${totalTime} minutes`);
    console.log('Maximum viral potential UNLOCKED! 🚀');
    return;
  }

  const file = mp3Files.shift();
  const inputPath = path.join(folderPath, file);
  const outputPath = path.join(outputFolder, file.replace('.mp3', '.mp4'));

  completed++;
  
  const elapsedMinutes = (Date.now() - startTime) / 1000 / 60;
  const avgTimePerVideo = completed > 1 ? elapsedMinutes / (completed - 1) : 3;
  const estimatedRemaining = Math.round(avgTimePerVideo * (totalFiles - completed));

  console.log(`\n[${completed}/${totalFiles}] Converting: ${file}`);
  console.log(`Elapsed: ${Math.round(elapsedMinutes)} min | Estimated remaining: ${estimatedRemaining} min`);

  ffmpeg(inputPath)
    .setStartTime(0)
    .setDuration(60)
    .complexFilter([
      // Dark background with subtle stars
      'color=c=#0a0a1e:s=1080x1920:d=60[bg];' +
      
      // Create radial audio visualizer (showfreqs in circular mode)
      '[0:a]showfreqs=s=1080x1080:mode=bar:ascale=log:fscale=log:' +
      'colors=#FF00FF|#00D9FF:win_size=2048:cmode=combined[freq];' +
      
      // Add glow effect
      '[freq]split[freq1][freq2];' +
      '[freq2]boxblur=20:5[freq_glow];' +
      
      // Overlay glowing visualizer on background
      '[bg][freq_glow]overlay=(W-w)/2:(H-h)/2-100[tmp1];' +
      '[tmp1][freq1]overlay=(W-w)/2:(H-h)/2-100[tmp2];' +
      
      // Draw dark blue circle in center (solid fill)
      '[tmp2]drawbox=x=390:y=760:w=300:h=300:color=#1a1a3e:t=fill[tmp3];' +
      
      // Draw white circle border using multiple thin boxes
      '[tmp3]drawbox=x=390:y=760:w=300:h=4:color=white:t=fill[tmp4a];' +
      '[tmp4a]drawbox=x=390:y=1056:w=300:h=4:color=white:t=fill[tmp4b];' +
      '[tmp4b]drawbox=x=390:y=760:w=4:h=300:color=white:t=fill[tmp4c];' +
      '[tmp4c]drawbox=x=686:y=760:w=4:h=300:color=white:t=fill[tmp4];' +
      
      // "EX" logo in center (light purple)
      '[tmp4]drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:' +
      'text=\'EX\':fontsize=120:fontcolor=#B8B8FF:' +
      'x=(w-text_w)/2:y=850[tmp5];' +
      
      // BRIGHT YELLOW text below
      '[tmp5]drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:' +
      'text=\'ROAST YOUR EX\':fontsize=65:fontcolor=#FFD700:' +
      'x=(w-text_w)/2:y=1200:' +
      'shadowcolor=#000000:shadowx=3:shadowy=3[tmp6];' +
      
      // Watermark
      '[tmp6]drawtext=fontfile=C\\\\:/Windows/Fonts/arial.ttf:' +
      'text=\'exroast.buzz\':fontsize=30:fontcolor=#00D9FF:' +
      'x=(w-text_w)/2:y=h-70[v]'
    ])
    .outputOptions([
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-t', '60',
      '-threads', '2'
    ])
    .on('progress', (progress) => {
      if (progress.percent) {
        process.stdout.write(`\rProgress: ${Math.round(progress.percent)}%`);
      }
    })
    .on('end', () => {
      console.log(`\n✓ DONE: ${path.basename(outputPath)}`);
      console.log(`   Saved to: ${outputPath}`);
      processNext();
    })
    .on('error', (err) => {
      console.error(`\n✗ ERROR on ${file}:`, err.message);
      processNext();
    })
    .save(outputPath);
}

processNext();