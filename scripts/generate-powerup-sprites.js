const fs = require('fs');
const path = require('path');

// Helper function to create a simple PNG file
function createPNG(width, height, pixels) {
    // pixels is an array of [r, g, b, a] values
    const PNG = require('pngjs').PNG;
    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (width * y + x) * 4;
            const pixelData = pixels[y * width + x] || [0, 0, 0, 0];
            png.data[idx] = pixelData[0];     // red
            png.data[idx + 1] = pixelData[1]; // green
            png.data[idx + 2] = pixelData[2]; // blue
            png.data[idx + 3] = pixelData[3]; // alpha
        }
    }

    return PNG.sync.write(png);
}

// Create 16x16 pixel art sprites
const SIZE = 16;
const TRANSPARENT = [0, 0, 0, 0];
const BLACK = [0, 0, 0, 255];
const WHITE = [255, 255, 255, 255];

// Speed Boost - Lightning bolt (cyan)
function createSpeedBoost() {
    const pixels = new Array(SIZE * SIZE).fill(TRANSPARENT);
    const cyan = [0, 255, 255, 255];
    const cyanDark = [0, 180, 180, 255];

    // Lightning bolt pattern
    const pattern = [
        "    ***     ",
        "   ****     ",
        "  *****     ",
        "  ****      ",
        "   *****    ",
        "    ******  ",
        "      ***** ",
        "       **** ",
        "      ****  ",
        "     ***    ",
        "    **      ",
        "   **       ",
    ];

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length && x < SIZE; x++) {
            if (pattern[y][x] === '*') {
                const idx = (y + 2) * SIZE + x;
                pixels[idx] = (y % 2 === 0) ? cyan : cyanDark;
            }
        }
    }

    return createPNG(SIZE, SIZE, pixels);
}

// Shield - Shield icon (blue)
function createShield() {
    const pixels = new Array(SIZE * SIZE).fill(TRANSPARENT);
    const blue = [65, 105, 225, 255];
    const blueDark = [30, 60, 180, 255];
    const blueLight = [100, 140, 255, 255];

    // Shield pattern
    const pattern = [
        "   ******   ",
        "  ********  ",
        " ********** ",
        " ********** ",
        "************",
        "************",
        "************",
        " ********** ",
        " ********** ",
        "  ********  ",
        "   ******   ",
        "    ****    ",
        "     **     ",
    ];

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length && x < SIZE; x++) {
            if (pattern[y][x] === '*') {
                const idx = (y + 1) * SIZE + x;
                if (x < SIZE / 2) {
                    pixels[idx] = blueLight;
                } else if (x === Math.floor(SIZE / 2)) {
                    pixels[idx] = blue;
                } else {
                    pixels[idx] = blueDark;
                }
            }
        }
    }

    return createPNG(SIZE, SIZE, pixels);
}

// Rapid Fire - Flame icon (orange)
function createRapidFire() {
    const pixels = new Array(SIZE * SIZE).fill(TRANSPARENT);
    const orange = [255, 102, 0, 255];
    const orangeLight = [255, 140, 0, 255];
    const red = [255, 50, 0, 255];
    const yellow = [255, 200, 0, 255];

    // Flame pattern
    const pattern = [
        "     **     ",
        "    ****    ",
        "   *** **   ",
        "  ***  ***  ",
        "  **    **  ",
        " ***    *** ",
        " **      ** ",
        " **      ** ",
        "  **    **  ",
        "  ***  ***  ",
        "   ******   ",
        "    ****    ",
        "     **     ",
    ];

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length && x < SIZE; x++) {
            if (pattern[y][x] === '*') {
                const idx = (y + 1) * SIZE + x;
                if (y < 4) {
                    pixels[idx] = yellow;
                } else if (y < 8) {
                    pixels[idx] = orangeLight;
                } else {
                    pixels[idx] = orange;
                }
            }
        }
    }

    return createPNG(SIZE, SIZE, pixels);
}

// Invisibility - Ghost icon (gray/silver)
function createInvisibility() {
    const pixels = new Array(SIZE * SIZE).fill(TRANSPARENT);
    const gray = [192, 192, 192, 200];
    const grayDark = [140, 140, 140, 200];
    const grayLight = [220, 220, 220, 200];

    // Ghost pattern
    const pattern = [
        "   ******   ",
        "  ********  ",
        " ********** ",
        "************",
        "** ** ** ***",
        "************",
        "************",
        "************",
        "************",
        "************",
        "** ** ** ***",
        " ** ** ** **",
    ];

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length && x < SIZE; x++) {
            if (pattern[y][x] === '*') {
                const idx = (y + 2) * SIZE + x;
                if (y < 4 || (y === 4 && x % 3 !== 0)) {
                    pixels[idx] = grayLight;
                } else {
                    pixels[idx] = gray;
                }
            }
        }
    }

    return createPNG(SIZE, SIZE, pixels);
}

// Double Damage - Star/explosion icon (pink)
function createDoubleDamage() {
    const pixels = new Array(SIZE * SIZE).fill(TRANSPARENT);
    const pink = [255, 20, 147, 255];
    const pinkLight = [255, 100, 180, 255];
    const pinkDark = [200, 0, 100, 255];

    // Star/explosion pattern
    const pattern = [
        "     **     ",
        "  ** ** **  ",
        "   ******   ",
        " ***  *  ***",
        "  ********  ",
        "************",
        " ********** ",
        "************",
        "  ********  ",
        " ***  *  ***",
        "   ******   ",
        "  ** ** **  ",
        "     **     ",
    ];

    for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length && x < SIZE; x++) {
            if (pattern[y][x] === '*') {
                const idx = (y + 1) * SIZE + x;
                const distFromCenter = Math.abs(x - SIZE/2) + Math.abs(y + 1 - SIZE/2);
                if (distFromCenter < 4) {
                    pixels[idx] = pinkLight;
                } else if (distFromCenter < 7) {
                    pixels[idx] = pink;
                } else {
                    pixels[idx] = pinkDark;
                }
            }
        }
    }

    return createPNG(SIZE, SIZE, pixels);
}

// Main execution
async function main() {
    try {
        // Check if pngjs is available
        try {
            require('pngjs');
        } catch (e) {
            console.log('Installing pngjs...');
            require('child_process').execSync('npm install pngjs', { stdio: 'inherit', cwd: __dirname });
        }

        const outputDir = path.join(__dirname, '..', 'packages', 'client', 'src', 'game', 'assets', 'images', 'prop');

        console.log('Generating powerup sprites...');

        fs.writeFileSync(path.join(outputDir, 'speed-boost.png'), createSpeedBoost());
        console.log('✓ Created speed-boost.png');

        fs.writeFileSync(path.join(outputDir, 'shield.png'), createShield());
        console.log('✓ Created shield.png');

        fs.writeFileSync(path.join(outputDir, 'rapid-fire.png'), createRapidFire());
        console.log('✓ Created rapid-fire.png');

        fs.writeFileSync(path.join(outputDir, 'invisibility.png'), createInvisibility());
        console.log('✓ Created invisibility.png');

        fs.writeFileSync(path.join(outputDir, 'double-damage.png'), createDoubleDamage());
        console.log('✓ Created double-damage.png');

        console.log('\nAll powerup sprites created successfully!');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();
