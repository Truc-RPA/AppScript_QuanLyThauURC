import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';

export async function GET() {
    try {
        const rows = await getSheetData('Data');
        if (!rows || rows.length < 2) {
            return NextResponse.json([]);
        }

        const today = new Date();
        const result = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 9) continue;

            const trangThai = (row[8] || '').trim();
            const isApproved = String(row[11]).toUpperCase() === 'TRUE';
            const tuNgay = row[5] || '';
            const denNgay = row[6] || '';

            // Tính toán Tình trạng thi công
            let tinhTrang = '';
            if (trangThai === 'Đã hủy') {
                tinhTrang = 'Đã hủy';
            } else if (trangThai === 'Hoàn thành') {
                tinhTrang = 'Hoàn thành';
            } else if (!isApproved) {
                tinhTrang = 'Giấy phép chưa hiệu lực';
            } else {
                const start = new Date(tuNgay);
                const end = new Date(denNgay);
                if (today < start) {
                    tinhTrang = 'Chưa đến hạn thi công';
                } else if (today > end) {
                    tinhTrang = 'Ngoài thời hạn';
                } else {
                    tinhTrang = 'Đang thi công';
                }
            }

            // Format ngày
            const formatDate = (d: string) => {
                if (!d) return '';
                const dt = new Date(d);
                return dt.toLocaleDateString('vi-VN');
            };

            result.push({
                rowIndex: i + 1,
                timestamp: row[0] || '',
                tenNhaThau: row[1] || '',
                phongBan: row[2] || '',
                nguoiPhuTrach: row[3] || '',
                khuVuc: row[4] || '',
                tuNgay: formatDate(tuNgay),
                denNgay: formatDate(denNgay),
                hangMuc: row[7] || '',
                trangThai,
                folderLink: row[9] || '',
                fileLink: row[10] || '',
                isApproved,
                tinhTrang,
            });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('getDataForList error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
