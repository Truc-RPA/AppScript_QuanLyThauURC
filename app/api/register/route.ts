import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { appendRow, getSheetData } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tenNhaThau, phongBan, nguoiPhuTrach, khuVuc, tuNgay, denNgay, hangMuc, files, folderLink: clientFolderLink, fileLink: clientFileLink } = body;

        // Validate
        if (!tenNhaThau || !phongBan || !khuVuc || !tuNgay || !denNgay || !hangMuc) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        let folderLink = clientFolderLink || '';
        let fileLink = clientFileLink || '';

        // Chỉ tạo folder qua Webhook nếu Client chưa gửi link (phòng trường hợp dùng API cũ)
        if (!folderLink && files && files.length > 0) {
            const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
            if (FOLDER_ID && FOLDER_ID !== 'YOUR_DRIVE_FOLDER_ID_HERE') {
                try {
                    const folderName = `${tenNhaThau}_${new Date().toISOString().split('T')[0]}`;

                    const formattedFiles = (files || []).map((f: any) => {
                        const mimeType = f.name.endsWith('.pdf') ? 'application/pdf' :
                            (f.name.endsWith('.png') ? 'image/png' : 'image/jpeg');
                        return { name: f.name, base64: f.data, mimeType: mimeType };
                    });

                    const payload = { parentFolderId: FOLDER_ID, folderName: folderName, files: formattedFiles };

                    const webhookUrl = process.env.GAS_WEBHOOK_URL || '';
                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();
                    if (data.folderUrl || data.success) {
                        folderLink = data.folderUrl || '';
                        fileLink = (data.fileUrls || []).join('\n');
                    }
                } catch (driveError: any) {
                    console.error('Drive Webhook error:', driveError);
                }
            }
        }

        // Ghi vào sheet Data
        const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const newRow = [
            timestamp, tenNhaThau, phongBan, nguoiPhuTrach, khuVuc, tuNgay, denNgay, hangMuc,
            'Chờ xác minh', folderLink, fileLink, false,
        ];

        await appendRow('Data', newRow);

        return NextResponse.json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error: any) {
        console.error('processForm error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi: ' + error.message }, { status: 500 });
    }
}
