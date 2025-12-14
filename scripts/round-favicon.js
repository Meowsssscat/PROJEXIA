const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log('Sharp not installed. Installing...');
    console.log('Run: npm install sharp --save-dev');
    process.exit(1);
}

const inputPath = path.join(__dirname, '../public/images/favicon.png');
const outputPath = path.join(__dirname, '../public/images/favicon-rounded.png');

async function createRoundedFavicon() {
    try {
        // Read the original image
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        const size = Math.min(metadata.width, metadata.height);
        
        // Create a circular mask
        const circle = Buffer.from(
            `<svg width="${size}" height="${size}">
                <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
            </svg>`
        );
        
        // Process the image: resize with zoom (1.2x), then apply circular mask
        await sharp(inputPath)
            .resize(Math.round(size * 1.2), Math.round(size * 1.2))
            .extract({
                left: Math.round(size * 0.1),
                top: Math.round(size * 0.1),
                width: size,
                height: size
            })
            .composite([{
                input: circle,
                blend: 'dest-in'
            }])
            .png()
            .toFile(outputPath);
        
        console.log('✓ Rounded favicon created successfully!');
        console.log(`  Output: ${outputPath}`);
        console.log('\nNext steps:');
        console.log('1. Check the rounded favicon at public/images/favicon-rounded.png');
        console.log('2. If it looks good, replace favicon.png with favicon-rounded.png');
        console.log('   Or run: copy public\\images\\favicon-rounded.png public\\images\\favicon.png');
        
    } catch (error) {
        console.error('Error creating rounded favicon:', error.message);
        process.exit(1);
    }
}

createRoundedFavicon();
