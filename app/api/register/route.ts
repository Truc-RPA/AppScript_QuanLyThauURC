import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { appendRow, getSheetData } from '@/lib/google-sheets';
import { createFolder, uploadFile, shareWithEmail } from '@/lib/google-drive';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { tenNhaThau, phongBan, nguoiPhuTrach, khuVuc, tuNgay, denNgay, hangMuc, files } = body;

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

                // Upload files nếu có
                if (files && files.length > 0) {
                    const uploadedLinks = [];
                    for (const f of files) {
                        try {
                            const base64Data = f.data.includes(',') ? f.data.split(',')[1] : f.data;
                            const buffer = Buffer.from(base64Data, 'base64');
                            const mimeType = f.name.endsWith('.pdf') ? 'application/pdf' :
                                (f.name.endsWith('.png') ? 'image/png' : 'image/jpeg');
                            const file = await uploadFile(f.name, mimeType, buffer, folder.id);
                            uploadedLinks.push(file.url);
                        } catch (e) {
                            console.error('Lỗi upload file:', f.name, e);
                        }
                    }
                    fileLink = uploadedLinks.join('\\n');
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
