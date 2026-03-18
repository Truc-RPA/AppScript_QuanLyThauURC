import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { appendRow, getSheetData } from '@/lib/google-sheets';

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

        // Tạo folder trên Drive qua Webhook (Gas Web App)
        if (FOLDER_ID && FOLDER_ID !== 'YOUR_DRIVE_FOLDER_ID_HERE') {
            try {
                const folderName = `${tenNhaThau}_${new Date().toISOString().split('T')[0]}`;

                const formattedFiles = (files || []).map((f: any) => {
                    const mimeType = f.name.endsWith('.pdf') ? 'application/pdf' :
                        (f.name.endsWith('.png') ? 'image/png' : 'image/jpeg');
                    return {
                        name: f.name,
                        base64: f.data,
                        mimeType: mimeType
                    };
                });

                const payload = {
                    parentFolderId: FOLDER_ID,
                    folderName: folderName,
                    files: formattedFiles
                };

                const webhookUrl = process.env.GAS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbw3psBNUhj_-UV-gwTXtJimn8PLI2_VyshlPcTWv_YWEPwXYO_1KAalWGIwzl_MXgSPfw/exec';
                const response = await fetch(webhookUrl, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (data.folderUrl || data.success) {
                    folderLink = data.folderUrl || '';
                    fileLink = (data.fileUrls || []).join('\\n');
                } else {
                    console.error('GAS Webhook Error:', data.error);
                }
            } catch (driveError: any) {
                console.error('Drive Webhook error:', driveError);
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
