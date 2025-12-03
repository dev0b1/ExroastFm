"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
// Header/Footer provided by NavWrapper in root layout
import { FaUpload, FaCheckCircle } from 'react-icons/fa';

export default function AdminPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [keywords, setKeywords] = useState('');
  const [mode, setMode] = useState('petty');
  const [mood, setMood] = useState('savage');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !keywords) {
      setMessage('Please provide audio file and keywords');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('keywords', keywords);
      formData.append('mode', mode);
      formData.append('mood', mood);

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Template uploaded successfully!');
        setAudioFile(null);
        setKeywords('');
        (document.getElementById('audioInput') as HTMLInputElement).value = '';
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-exroast-black">
      {/* Header rendered by NavWrapper */}
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl p-8 border-2 border-exroast-pink/30"
          >
            <h1 className="text-4xl font-black text-exroast-gold mb-2">
              🔥 Admin Panel
            </h1>
            <p className="text-gray-400 mb-8">
              Upload MP3 templates for free tier users
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-exroast-gold font-bold mb-2">
                  MP3 Audio File *
                </label>
                <div className="relative">
                  <input
                    id="audioInput"
                    type="file"
                    accept="audio/mpeg,audio/mp3"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="w-full bg-black text-white border-2 border-exroast-pink/30 rounded-lg px-4 py-3 focus:border-exroast-pink focus:outline-none"
                  />
                  <FaUpload className="absolute right-4 top-1/2 -translate-y-1/2 text-exroast-pink pointer-events-none" />
                </div>
                {audioFile && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                    <FaCheckCircle /> {audioFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-exroast-gold font-bold mb-2">
                  Keywords (comma-separated) *
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="ghost, cheating, toxic, liar, petty"
                  className="w-full bg-black text-white border-2 border-exroast-pink/30 rounded-lg px-4 py-3 focus:border-exroast-pink focus:outline-none"
                />
                <p className="text-gray-500 text-sm mt-1">
                  These keywords help match user stories to templates
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-exroast-gold font-bold mb-2">
                    Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-black text-white border-2 border-exroast-pink/30 rounded-lg px-4 py-3 focus:border-exroast-pink focus:outline-none"
                  >
                    <option value="petty">Petty</option>
                    <option value="savage">Savage</option>
                    <option value="sad">Sad</option>
                    <option value="healing">Healing</option>
                    <option value="vibe">Vibe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-exroast-gold font-bold mb-2">
                    Mood
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-black text-white border-2 border-exroast-pink/30 rounded-lg px-4 py-3 focus:border-exroast-pink focus:outline-none"
                  >
                    <option value="savage">Savage</option>
                    <option value="emotional">Emotional</option>
                    <option value="empowering">Empowering</option>
                    <option value="funny">Funny</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !audioFile || !keywords}
                className="w-full bg-gradient-to-r from-exroast-pink to-exroast-gold text-white font-black py-4 rounded-full text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {uploading ? 'Uploading...' : 'Upload Template 🚀'}
              </button>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${
                    message.includes('✅')
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </form>

            <div className="mt-8 p-4 bg-black/50 rounded-lg">
              <h3 className="text-exroast-pink font-bold mb-2">💡 Tips:</h3>
              <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                <li>MP3 files should be 15-30 seconds long</li>
                <li>Use descriptive keywords that users might mention in their stories</li>
                <li>Include variations: "ghost" → "ghosting, ghosted, disappeared"</li>
                <li>Test with common breakup scenarios</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer rendered by NavWrapper */}
    </div>
  );
}
