import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';

export async function GET() {
    try {
        const rows = await getSheetData('YeuCauURC', 'A1');
        const content = rows?.[0]?.[0] || '';
        return NextResponse.json({ content });
    } catch (error: any) {
        console.error('getUrcContent error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
