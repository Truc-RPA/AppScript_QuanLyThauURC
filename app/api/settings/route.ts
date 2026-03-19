import { NextRequest, NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await getSheetData('CaiDat');
        if (!rows || rows.length < 2) {
            return NextResponse.json([]);
        }

        const settings = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 1) continue;

            const dept = (row[0] || '').trim();
            if (dept === 'ADMIN') continue;

            settings.push({
                department: dept,
                name: (row[1] || '').trim(),           // Cột B: Người phụ trách
                email: (row[2] || '').trim(),          // Cột C: Email
                khuVuc: (row[3] || '').trim(),         // Cột D: Khu vực
            });
        }

        return NextResponse.json(settings);
    } catch (error: any) {
        console.error('getSettings error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
