import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateCell } from '@/lib/google-sheets';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, message: 'Chưa đăng nhập' }, { status: 401 });
        }

        const { rowIndex, action } = await req.json();

        if (!rowIndex || !action) {
            return NextResponse.json({ success: false, message: 'Thiếu thông tin' }, { status: 400 });
        }

        let newStatus = '';
        let isApproved: boolean | null = null;

        switch (action) {
            case 'Verify':
                newStatus = 'Đã xác minh';
                break;
            case 'Approve':
                newStatus = 'Đã phê duyệt';
                isApproved = true;
                break;
            case 'Cancel':
                newStatus = 'Đã hủy';
                isApproved = false;
                break;
            case 'Finish':
                newStatus = 'Hoàn thành';
                break;
            default:
                return NextResponse.json({ success: false, message: 'Action không hợp lệ' }, { status: 400 });
        }

        // Cập nhật trạng thái (cột I = cột 9)
        await updateCell('Data', `I${rowIndex}`, newStatus);

        // Cập nhật isApproved nếu cần (cột L = cột 12)
        if (isApproved !== null) {
            await updateCell('Data', `L${rowIndex}`, isApproved);
        }

        // TODO: Gửi email thông báo qua Resend

        const actionLabels: Record<string, string> = {
            Verify: 'xác minh',
            Approve: 'phê duyệt',
            Cancel: 'hủy',
            Finish: 'hoàn thành',
        };

        return NextResponse.json({
            success: true,
            message: `Đã ${actionLabels[action]} thành công!`,
        });
    } catch (error: any) {
        console.error('updateStatus error:', error);
        return NextResponse.json({ success: false, message: 'Lỗi: ' + error.message }, { status: 500 });
    }
}
