const fs = require("fs");
const crypto = require("crypto");

// 🔑 CHANGE THIS PASSWORD (must match what user enters)
const PASSWORD = "put-secret-password-here";

// ⚙️ Crypto settings (MUST match browser)
const ITERATIONS = 200000;
const KEY_LEN = 32; // 256-bit
const SALT_LEN = 16;
const IV_LEN = 12;

function encryptFile(inputPath, outputPath) {
    const fileData = fs.readFileSync(inputPath);

    // 🔐 Generate salt + derive key
    const salt = crypto.randomBytes(SALT_LEN);
    const key = crypto.pbkdf2Sync(
        PASSWORD,
        salt,
        ITERATIONS,
        KEY_LEN,
        "sha256"
    );

    // 🔐 AES-GCM encryption
    const iv = crypto.randomBytes(IV_LEN);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
        cipher.update(fileData),
        cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // 📦 Final format:
    // [salt][iv][ciphertext][tag]
    const output = Buffer.concat([
        salt,
        iv,
        encrypted,
        tag
    ]);

    fs.writeFileSync(outputPath, output);

    console.log(`✅ Encrypted: ${inputPath} → ${outputPath} `);
}

// 📁 Ensure output folder exists
if (!fs.existsSync("enc")) {
    fs.mkdirSync("enc");
}

// 🖼️ Encrypt images (adjust names if needed)
for (let i = 1; i <= 7; i++) {
    encryptFile(
        `image${i}.jpeg`,
        `enc/image${i}.bin`
    );
}

// 🎧 Encrypt music
encryptFile(
    "soft-music.mp3",
    "enc/music.bin"
);

console.log("\n🎉 All files encrypted successfully!");