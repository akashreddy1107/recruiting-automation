import { google } from 'googleapis';
import * as authService from './authService.js';
import User from '../models/User.js';
import { Readable } from 'stream';

async function getDriveClient(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const client = authService.getClient();
    client.setCredentials(user.tokens);
    return google.drive({ version: 'v3', auth: client });
}

export const uploadResume = async (email, fileName, mimeType, buffer) => {
    const drive = await getDriveClient(email);

    // 1. Check/Create "Resumes" folder
    let folderId;
    const folderRes = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.folder' and name='Resumes' and trashed=false",
        fields: 'files(id, name)',
    });

    if (folderRes.data.files.length > 0) {
        folderId = folderRes.data.files[0].id;
    } else {
        const createRes = await drive.files.create({
            resource: {
                name: 'Resumes',
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
        });
        folderId = createRes.data.id;
    }

    // 2. Upload File
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: mimeType,
        body: Readable.from(buffer),
    };

    const fileRes = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
    });

    // 3. Make file readable by anyone with link (optional, but good for sharing)
    // await drive.permissions.create({
    //     fileId: fileRes.data.id,
    //     resource: {
    //         role: 'reader',
    //         type: 'anyone',
    //     },
    // });

    return fileRes.data.webViewLink;
};
