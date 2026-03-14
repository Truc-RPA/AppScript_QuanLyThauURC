import { google } from 'googleapis';
import { Readable } from 'stream';

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

export async function createFolder(name: string, parentId: string): Promise<{ id: string; url: string }> {
    const res = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id, webViewLink',
    });
    return {
        id: res.data.id!,
        url: res.data.webViewLink || `https://drive.google.com/drive/folders/${res.data.id}`,
    };
}

export async function uploadFile(
    name: string,
    mimeType: string,
    buffer: Buffer,
    folderId: string
): Promise<{ id: string; url: string }> {
    const stream = Readable.from(buffer);

    const res = await drive.files.create({
        requestBody: {
            name,
            parents: [folderId],
        },
        media: {
            mimeType,
            body: stream,
        },
        fields: 'id, webViewLink',
    });
    return {
        id: res.data.id!,
        url: res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`,
    };
}

export async function shareWithEmail(fileId: string, email: string, role: string = 'writer'): Promise<void> {
    await drive.permissions.create({
        fileId,
        requestBody: {
            type: 'user',
            role,
            emailAddress: email,
        },
        sendNotificationEmail: false,
    });
}
