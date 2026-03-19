function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const { action, parentFolderId, folderName, folderId, file } = data; // action: 'create' hoặc 'upload'

        if (action === 'create') {
            const parentFolder = DriveApp.getFolderById(parentFolderId);
            const subFolder = parentFolder.createFolder(folderName);
            return createResponse({ success: true, folderId: subFolder.getId(), folderUrl: subFolder.getUrl() });
        }

        if (action === 'upload') {
            const targetFolder = DriveApp.getFolderById(folderId);
            let base64str = file.base64;
            if (base64str.includes(',')) base64str = base64str.split(',')[1];

            const blob = Utilities.newBlob(Utilities.base64Decode(base64str), file.mimeType, file.name);
            const newFile = targetFolder.createFile(blob);
            return createResponse({ success: true, fileUrl: newFile.getUrl() });
        }

        return createResponse({ success: false, error: 'Hành động không hợp lệ' });

    } catch (error) {
        return createResponse({ success: false, error: error.message });
    }
}

function createResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

// Bắt CORS (preflight OPTIONS) - Thực tế GAS không hỗ trợ OPTIONS method chuẩn qua Web App
// Nhưng ta giữ lại để Clean code nếu sau này dùng Proxy.
function doOptions(e) {
    return ContentService.createTextOutput("")
        .setMimeType(ContentService.MimeType.TEXT);
}
