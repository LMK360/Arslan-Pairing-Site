const { Storage } = require('megajs');
const fs = require('fs');

// Generate random ID (original function)
function makeid(length = 8) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Upload session to MEGA and return LMK-MD~ session ID
async function uploadSessionToMega(filePath, fileName) {
    const MEGA_EMAIL = process.env.MEGA_EMAIL;
    const MEGA_PASSWORD = process.env.MEGA_PASSWORD;
    
    if (!MEGA_EMAIL || !MEGA_PASSWORD) {
        console.log('MEGA credentials not set in env vars');
        return null;
    }
    
    try {
        const storage = new Storage({
            email: MEGA_EMAIL,
            password: MEGA_PASSWORD
        });
        
        await storage.ready;
        const fileBuffer = fs.readFileSync(filePath);
        const file = await storage.upload(fileName, fileBuffer).complete;
        
        // Extract file ID from MEGA link
        // Link format: https://mega.nz/file/8LN0wDDL#19LkDbYRHrSi7Jr_0G2b3DL0FvhBMuVqxqZ-mAbCCKo
        const megaUrl = file.link;
        const megaFileId = megaUrl.replace('https://mega.nz/file/', '');
        
        // Return our format
        return `LMK-MD~${megaFileId}`;
    } catch (err) {
        console.error('MEGA upload failed:', err.message);
        return null;
    }
}

// Fallback: create base64 session ID (no MEGA needed)
function createBase64Session(filePath) {
    const data = fs.readFileSync(filePath);
    const b64data = Buffer.from(data).toString('base64');
    return `ARSLAN-MD~${b64data}`;
}

module.exports = {
    makeid,
    uploadSessionToMega,
    createBase64Session
};
