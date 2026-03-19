import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await getSheetData('YeuCauURC', 'A1:A');
        const content = rows
            .map(row => row[0])
            .filter(text => text !== undefined && text !== '')
            .join('\n\n');
        return NextResponse.json({ content });
    } catch (error: any) {
        console.error('getUrcContent error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
