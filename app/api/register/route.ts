import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { appendRow, getSheetData } from '@/lib/google-sheets';
import { createFolder, uploadFile, shareWithEmail } from '@/lib/google-drive';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const body = await req.json();
        const { tenNhaThau, phongBan, khuVuc, tuNgay, denNgay, hangMuc, fileData, fileName } = body;

        // Validate
        if (!tenNhaThau || !phongBan || !khuVuc || !tuNgay || !denNgay || !hangMuc) {
            return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
        }

        const FOLDER_ID = process.env.DRIVE_FOLDER_ID;
        let folderLink = '';
        let fileLink = '';

        // Tạo folder trên Drive
        if (FOLDER_ID && FOLDER_ID !== 'YOUR_DRIVE_FOLDER_ID_HERE') {
            try {
                const folderName = `${tenNhaThau}_${new Date().toISOString().split('T')[0]}`;
                const folder = await createFolder(folderName, FOLDER_ID);
                folderLink = folder.url;

                // Upload file nếu có
                if (fileData && fileName) {
                    const buffer = Buffer.from(fileData, 'base64');
                    const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
                    const file = await uploadFile(fileName, mimeType, buffer, folder.id);
                    fileLink = file.url;
                }

                // Chia sẻ folder cho người phụ trách
                const settingsRows = await getSheetData('CaiDat');
                for (let i = 1; i < settingsRows.length; i++) {
                    const row = settingsRows[i];
                    if (row && row[0] === phongBan && row[2]) {
                        try { await shareWithEmail(folder.id, row[2].trim()); } catch (e) { /* ignore */ }
                    }
                }
            } catch (driveError: any) {
                console.error('Drive error:', driveError);
                // Tiếp tục lưu data dù Drive lỗi
            }
        }

        // Ghi vào sheet Data
        const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const nguoiPhuTrach = session.user.name || session.user.email;
        const newRow = [
            timestamp,       // Timestamp
            tenNhaThau,      // Tên NT
            phongBan,        // Phòng ban
            nguoiPhuTrach,   // Người phụ trách
            khuVuc,          // Khu vực
            tuNgay,          // Ngày bắt đầu
            denNgay,         // Ngày kết thúc
            hangMuc,         // Hạng mục
            'Chờ xác minh',  // Trạng thái
            folderLink,      // Link Folder
            fileLink,        // Link File
            false,           // isApproved
        ];

        await appendRow('Data', newRow);

        // TODO: Gửi email thông báo qua Resend

        return NextResponse.json({ success: true, message: 'Đăng ký thành công!' });
    } catch (error: any) {
        console.error('processForm error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi: ' + error.message }, { status: 500 });
    }
}
