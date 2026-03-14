import { google, sheets_v4 } from 'googleapis';

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;

export async function getSheetData(sheetName: string, range?: string): Promise<string[][]> {
    const fullRange = range ? `${sheetName}!${range}` : sheetName;
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: fullRange,
    });
    return (res.data.values as string[][]) || [];
}

export async function appendRow(sheetName: string, values: (string | boolean | number)[]): Promise<void> {
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
    });
}

export async function updateCell(sheetName: string, cell: string, value: string | boolean): Promise<void> {
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${cell}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[value]] },
    });
}

export async function updateRange(sheetName: string, range: string, values: (string | boolean)[][]): Promise<void> {
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
}
