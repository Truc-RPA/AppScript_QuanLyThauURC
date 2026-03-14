import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSheetData } from '@/lib/google-sheets';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ role: 'GUEST', name: 'Khách', department: '', areas: [] });
        }

        const email = session.user.email.toLowerCase().trim();
        const rows = await getSheetData('CaiDat');

        if (!rows || rows.length < 2) {
            return NextResponse.json({ role: 'GUEST', name: 'Khách', department: '', areas: [] });
        }

        let result = { role: 'GUEST', name: 'Khách', department: '', areas: [] as string[] };

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 3) continue;

            const rowDept = (row[0] || '').trim();
            const rowName = (row[1] || '').trim();
            const rowEmail = (row[2] || '').toLowerCase().trim();
            const rowAreas = (row[3] || '').split(',').map((a: string) => a.trim()).filter(Boolean);

            if (rowEmail === email) {
                if (rowDept === 'ADMIN') {
                    return NextResponse.json({
                        role: 'ADMIN',
                        name: rowName || 'Admin',
                        department: 'ADMIN',
                        areas: rowAreas,
                    });
                }
                result = {
                    role: 'STAFF',
                    name: rowName,
                    department: rowDept,
                    areas: rowAreas,
                };
            }
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('getUserRole error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
