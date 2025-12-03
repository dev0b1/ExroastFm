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
  const avgTimePerVideo = completed > 1 ? elapsedMinutes / (completed - 1) : 5;
  const estimatedRemaining = Math.round(avgTimePerVideo * (totalFiles - completed));

  console.log(`\n[${completed}/${totalFiles}] Converting: ${file}`);
  console.log(`Elapsed: ${Math.round(elapsedMinutes)} min | Estimated remaining: ${estimatedRemaining} min`);

  ffmpeg(inputPath)
    .setStartTime(0)
    .setDuration(60)
    .complexFilter([
      // Background
      'color=c=#000000:s=1080x1920:d=60[bg];' +
      
      // Central pulsing waveform
      '[0:a]showwaves=s=800x800:mode=p2p:colors=#FF006E|#8338EC:scale=sqrt:rate=30[wave];' +
      
      // Frequency bars
      '[0:a]showfreqs=s=1080x600:mode=bar:ascale=log:fscale=log:colors=#FF006E|#8338EC|#3A86FF|#06FFA5:cmode=combined[freq];' +
      '[freq]split[freq1][freq2];[freq2]vflip[freq_flip];' +
      
      // Layer bars
      '[bg][freq1]overlay=(W-w)/2:50[tmp1];' +
      '[tmp1][freq_flip]overlay=(W-w)/2:H-650[tmp2];' +
      
      // Glow effect
      '[tmp2]boxblur=6:1[blurred];' +
      '[blurred][wave]overlay=(W-w)/2:(H-h)/2,eq=saturation=1.8:contrast=1.2[tmp3];' +
      
      // SEMI-TRANSPARENT BLACK BOX behind text for contrast
      '[tmp3]drawbox=x=0:y=80:w=1080:h=180:color=black@0.6:t=fill[tmp_box];' +
      
      // LOGO - Yellow/gold for maximum pop (like verified badges)
      '[tmp_box]drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:' +
      'text=\'exroast.buzz\':fontsize=72:fontcolor=#FFD700:' +  // Gold color
      'x=(w-text_w)/2:y=100:' +
      'shadowcolor=black:shadowx=3:shadowy=3:' +
      'borderw=3:bordercolor=#000000[tmp4];' +
      
      // Tagline - Bright white, NO transparency, black shadow
      '[tmp4]drawtext=fontfile=C\\\\:/Windows/Fonts/arial.ttf:' +
      'text=\'AI Roasted Your Ex 🔥\':fontsize=38:fontcolor=#FFFFFF:' +  // Full white, no transparency
      'x=(w-text_w)/2:y=190:' +
      'shadowcolor=black:shadowx=2:shadowy=2[v]'
    ])
    .outputOptions([
      '-map', '[v]',
      '-map', '0:a',
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '25',
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