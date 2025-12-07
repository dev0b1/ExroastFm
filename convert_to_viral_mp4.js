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
      // Dark blue/purple background (matching image 2)
      'color=c=#0a0a1e:s=1080x1920:d=60[bg];' +
      
      // Add subtle noise/stars effect
      'geq=random(1)*255:128:128[noise];' +
      '[noise]scale=1080:1920,fade=in:0:30:alpha=1[stars];' +
      '[bg][stars]overlay=format=auto:alpha=0.15[bg_stars];' +
      
      // Create main circular visualizer (centered, audio-reactive)
      '[0:a]showfreqs=s=500x500:mode=bar:ascale=sqrt:fscale=log:' +
      'win_func=hann:overlap=0.75:' +
      'colors=#00D9FF|#B24BF3|#FF00FF:cmode=separate[freq_circle];' +
      
      // Create outer blue glow ring
      '[0:a]showfreqs=s=700x700:mode=bar:ascale=sqrt:fscale=log:' +
      'colors=#0066FF@0.4:cmode=combined[glow_blue];' +
      
      // Create outer purple/pink glow ring
      '[0:a]showfreqs=s=900x900:mode=bar:ascale=sqrt:fscale=log:' +
      'colors=#FF00FF@0.2:cmode=combined[glow_pink];' +
      
      // Apply heavy blur to glows
      '[glow_pink]boxblur=50:5[glow_pink_blur];' +
      '[glow_blue]boxblur=30:3[glow_blue_blur];' +
      
      // Layer everything: bg + glows + main circle
      '[bg_stars][glow_pink_blur]overlay=(W-w)/2:(H-h)/2-50[tmp1];' +
      '[tmp1][glow_blue_blur]overlay=(W-w)/2:(H-h)/2-50[tmp2];' +
      '[tmp2][freq_circle]overlay=(W-w)/2:(H-h)/2-50[tmp3];' +
      
      // Dark circle in center for logo
      '[tmp3]drawbox=x=440:y=860:w=200:h=200:color=#0a0a1e@0.9:t=fill[tmp4];' +
      
      // "EX" text in center (like "Ae" logo style) - large bold
      '[tmp4]drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:' +
      'text=\'EX\':fontsize=90:fontcolor=#FFFFFF:' +
      'x=(w-text_w)/2:y=910:' +
      'shadowcolor=#000000:shadowx=0:shadowy=0[tmp5];' +
      
      // BRIGHT YELLOW/GOLD text below (like "REACT TO AUDIO")
      '[tmp5]drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:' +
      'text=\'ROAST YOUR EX\':fontsize=65:fontcolor=#FFD700:' +
      'x=(w-text_w)/2:y=1150:' +
      'shadowcolor=#000000:shadowx=3:shadowy=3:' +
      'box=1:boxcolor=#000000@0.6:boxborderw=15[tmp6];' +
      
      // Small watermark at bottom
      '[tmp6]drawtext=fontfile=C\\\\:/Windows/Fonts/arial.ttf:' +
      'text=\'exroast.buzz\':fontsize=32:fontcolor=#00D9FF:' +
      'x=(w-text_w)/2:y=h-80:' +
      'shadowcolor=#000000:shadowx=2:shadowy=2[v]'
    ])
    .outputOptions([
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-preset', 'fast',
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