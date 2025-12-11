const fs = require('fs');
const path = require('path');

// List of MP3 files to encode
const audioFiles = [
    'Asia.mp3',
    'China.mp3',
    'Europe.mp3',
    'North America.mp3',
    'Western.mp3'
];

// Function to encode a file to base64
function encodeToBase64(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64String = fileBuffer.toString('base64');
        return `data:audio/mp3;base64,${base64String}`;
    } catch (error) {
        console.error(`Error encoding ${filePath}:`, error.message);
        return null;
    }
}

// Encode all audio files
const encodedAudio = {};
audioFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`Encoding ${file}...`);
        const encoded = encodeToBase64(filePath);
        if (encoded) {
            // Extract the key name (filename without extension)
            const key = path.basename(file, '.mp3');
            encodedAudio[key] = encoded;
            console.log(`✓ ${file} encoded successfully`);
        }
    } else {
        console.warn(`⚠ ${file} not found`);
    }
});

// Write to a JavaScript file that exports the encoded audio
// Use a format that works in browsers without module system
const outputContent = `// Auto-generated base64 encoded audio files
// Generated on ${new Date().toISOString()}

// Export for ES6 modules
export const encodedAudio = ${JSON.stringify(encodedAudio, null, 2)};

// Also make available globally for browser use
if (typeof window !== 'undefined') {
    window.encodedAudio = ${JSON.stringify(encodedAudio, null, 2)};
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { encodedAudio: ${JSON.stringify(encodedAudio, null, 2)} };
}
`;

fs.writeFileSync(path.join(__dirname, 'audio', 'encoded-audio.js'), outputContent);
console.log('\n✓ Encoded audio saved to audio/encoded-audio.js');

// Also create a JSON file for easier inspection
fs.writeFileSync(
    path.join(__dirname, 'audio', 'encoded-audio-info.json'),
    JSON.stringify(
        Object.keys(encodedAudio).map(key => ({
            name: key,
            size: encodedAudio[key].length,
            preview: encodedAudio[key].substring(0, 50) + '...'
        })),
        null,
        2
    )
);
console.log('✓ Audio info saved to audio/encoded-audio-info.json');
