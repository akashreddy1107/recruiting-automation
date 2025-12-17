
import fs from 'fs';
try {
    const content = fs.readFileSync('debug_output.txt', 'utf8'); // Try utf8 first, usually node redirects are utf8
    console.log(content);
} catch (e) {
    try {
        const content = fs.readFileSync('debug_output.txt', 'utf16le'); // Try utf16le (powershell default)
        console.log(content);
    } catch (e2) {
        console.error("Failed to read");
    }
}
