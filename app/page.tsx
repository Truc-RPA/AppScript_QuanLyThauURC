'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';

// ==================== URC LOGO BASE64 ====================
const URC_LOGO = "data:image/png;base64,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";

// ==================== TYPES ====================
interface UserRole { role: string; name: string; department: string; areas: string[]; }
interface Setting { department: string; name: string; nguoiPhuTrach: string; khuVuc: string; }
interface ContractorItem {
    rowIndex: number; timestamp: string; tenNhaThau: string; phongBan: string;
    nguoiPhuTrach: string; khuVuc: string; tuNgay: string; denNgay: string;
    hangMuc: string; trangThai: string; folderLink: string; fileLink: string;
    isApproved: boolean; tinhTrang: string;
}

// ==================== MAIN PAGE ====================
export default function Home() {
    const { data: session, status: authStatus } = useSession();
    const [activeTab, setActiveTab] = useState('registration');
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [listData, setListData] = useState<ContractorItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);

    // ==================== TOAST ====================
    const showToast = useCallback((message: string, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // ==================== INIT ====================
    useEffect(() => {
        if (authStatus === 'loading') return;
        // Luôn load settings (phòng ban, khu vực) cho tất cả user kể cả GUEST
        const loadSettings = fetch('/api/settings').then(r => r.json()).catch(() => []);
        if (authStatus === 'unauthenticated') {
            setUserRole({ role: 'GUEST', name: 'Khách', department: '', areas: [] });
            loadSettings.then(s => { setSettings(Array.isArray(s) ? s : []); setLoading(false); });
            return;
        }
        Promise.all([
            fetch('/api/user-role').then(r => r.json()),
            loadSettings,
        ]).then(([role, s]) => {
            setUserRole(role);
            setSettings(Array.isArray(s) ? s : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [authStatus]);

    // ==================== RENDER ====================
    if (loading) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-sm">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    const roleIcons: Record<string, string> = { ADMIN: '👑', STAFF: '🛡️', GUEST: '👤' };
    const roleLabel = userRole?.role === 'ADMIN' ? 'Admin' :
        userRole?.role === 'STAFF' ? `Staff - ${userRole.department}` : 'Khách';

    return (
        <>
            {/* HEADER */}
            <header className="bg-gradient-to-r from-primary-800 via-primary-700 to-primary-600 text-white shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-10 -right-10 w-72 h-72 bg-white rounded-full" />
                    <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-white rounded-full" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={URC_LOGO} alt="URC Logo" className="h-16 sm:h-20 w-auto object-contain drop-shadow-md" />
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Quản lý Nhà thầu</h1>
                                <p className="text-primary-200 text-xs font-medium">URC Việt Nam — Contractor Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {session ? (
                                <>
                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-sm">
                                        <span>{roleIcons[userRole?.role || 'GUEST']}</span>
                                        <span className="font-medium text-primary-100">{roleLabel}</span>
                                    </div>
                                    <button onClick={() => signOut()} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => signIn('google')} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                    🔑 Đăng nhập Google
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex gap-0 overflow-x-auto">
                        {[
                            { id: 'registration', icon: '📝', label: 'Đăng ký' },
                            { id: 'list', icon: '📋', label: 'Danh sách' },
                            { id: 'search', icon: '🔍', label: 'Tra cứu' },
                            { id: 'urc', icon: '📜', label: 'Yêu cầu URC' },
                        ].map(tab => (
                            <button key={tab.id}
                                className={`tab-btn flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-gray-500 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => { setActiveTab(tab.id); if (tab.id === 'list') loadList(); }}>
                                <span>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {activeTab === 'registration' && <RegistrationTab settings={settings} showToast={showToast} />}
                {activeTab === 'list' && <ListTab listData={listData} loadList={loadList} userRole={userRole} showToast={showToast} />}
                {activeTab === 'search' && <SearchTab listData={listData} loadList={loadList} />}
                {activeTab === 'urc' && <UrcTab />}
            </main>

            {/* FOOTER */}
            <footer className="border-t border-gray-200 bg-white/80 backdrop-blur mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-gray-400">
                    © 2026 URC Việt Nam — Hệ thống Quản lý Nhà thầu. All rights reserved.
                </div>
            </footer>

            {/* TOASTS */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(t => {
                    const colors: Record<string, string> = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-amber-500' };
                    const icons: Record<string, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
                    return (
                        <div key={t.id} className={`toast ${colors[t.type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium min-w-[280px]`}>
                            <span>{icons[t.type]}</span><span>{t.message}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );

    // ==================== LOAD LIST ====================
    async function loadList() {
        try {
            const res = await fetch('/api/list');
            const data = await res.json();
            setListData(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
    }
}

// ==================== TAB 1: ĐĂNG KÝ ====================
function RegistrationTab({ settings, showToast }: { settings: Setting[]; showToast: (m: string, t: string) => void }) {
    const [form, setForm] = useState({ tenNhaThau: '', phongBan: '', nguoiPhuTrach: '', khuVuc: '', tuNgay: '', denNgay: '', hangMuc: '' });
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Lookup: Phòng ban (unique) từ cột A sheet CaiDat
    const departments = Array.from(new Set(settings.map(s => s.department).filter(Boolean)));

    // Auto-fill Người phụ trách (cột C) + Khu vực (cột D) khi chọn Phòng ban
    useEffect(() => {
        if (!form.phongBan) {
            setForm(prev => ({ ...prev, nguoiPhuTrach: '', khuVuc: '' }));
            return;
        }
        // Lọc người phụ trách và khu vực thuộc phòng ban vừa chọn
        const matches = settings.filter(s => s.department === form.phongBan);
        // Tự động điền nếu chỉ có 1 lựa chọn, nếu không thì reset để user tự chọn
        setForm(prev => ({
            ...prev,
            nguoiPhuTrach: matches.length === 1 ? (matches[0].name || '') : '',
            khuVuc: matches.length === 1 ? (matches[0].khuVuc || '') : '',
        }));
    }, [form.phongBan, settings]);

    // Danh sách Người phụ trách và Khu vực tương ứng với phòng ban hiện tại
    const currentMatches = settings.filter(s => s.department === form.phongBan);
    const phuTrachOptions = Array.from(new Set(currentMatches.map(s => s.name).filter(Boolean)));
    const khuVucOptions = Array.from(new Set(currentMatches.map(s => s.khuVuc).filter(Boolean)));

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newFiles = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...newFiles]);
        if (fileRef.current) fileRef.current.value = '';
    }

    function removeFile(index: number) {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (new Date(form.denNgay) < new Date(form.tuNgay)) { showToast('Ngày kết thúc phải sau ngày bắt đầu!', 'error'); return; }
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);
        if (totalSize > 50 * 1024 * 1024) { showToast('Tổng dung lượng file vượt quá 50MB!', 'error'); return; }
        setSubmitting(true);
        try {
            const filesData = await Promise.all(files.map(async f => ({
                name: f.name,
                data: await toBase64(f),
                size: f.size,
            })));
            const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, files: filesData }) });
            const result = await res.json();
            if (result.success) { showToast(result.message, 'success'); setForm({ tenNhaThau: '', phongBan: '', nguoiPhuTrach: '', khuVuc: '', tuNgay: '', denNgay: '', hangMuc: '' }); setFiles([]); }
            else showToast(result.message, 'error');
        } catch (err: any) { showToast('Lỗi: ' + err.message, 'error'); }
        setSubmitting(false);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
                <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📝</span>
                        Đăng ký Nhà thầu thi công
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">Điền đầy đủ thông tin để đăng ký giấy phép thi công</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <InputField label="Tên nhà thầu" required value={form.tenNhaThau} onChange={v => setForm({ ...form, tenNhaThau: v })} placeholder="Nhập tên công ty nhà thầu..." />
                    <SelectField label="Phòng ban" required value={form.phongBan} onChange={v => setForm({ ...form, phongBan: v })} options={departments} placeholder="-- Chọn phòng ban --" />
                    <SelectField
                        label="Người phụ trách"
                        required
                        value={form.nguoiPhuTrach}
                        onChange={v => setForm({ ...form, nguoiPhuTrach: v })}
                        options={phuTrachOptions}
                        placeholder={form.phongBan ? "-- Chọn người phụ trách --" : "Vui lòng chọn phòng ban trước"}
                        disabled={!form.phongBan || phuTrachOptions.length === 0}
                    />
                    <SelectField
                        label="Khu vực thi công"
                        required
                        value={form.khuVuc}
                        onChange={v => setForm({ ...form, khuVuc: v })}
                        options={khuVucOptions}
                        placeholder={form.phongBan ? "-- Chọn khu vực --" : "Vui lòng chọn phòng ban trước"}
                        disabled={!form.phongBan || khuVucOptions.length === 0}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Từ ngày <span className="text-red-500">*</span></label>
                            <input type="date" required value={form.tuNgay} onChange={e => setForm({ ...form, tuNgay: e.target.value })} className="form-input w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50/50" /></div>
                        <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Đến ngày <span className="text-red-500">*</span></label>
                            <input type="date" required value={form.denNgay} onChange={e => setForm({ ...form, denNgay: e.target.value })} className="form-input w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50/50" /></div>
                    </div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Hạng mục thi công <span className="text-red-500">*</span></label>
                        <textarea required rows={3} value={form.hangMuc} onChange={e => setForm({ ...form, hangMuc: e.target.value })} placeholder="Mô tả hạng mục công việc..." className="form-input w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50/50 resize-none" /></div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giấy phép / Hồ sơ đính kèm</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                            <input ref={fileRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileChange} />
                            <div className="text-3xl mb-2">📎</div>
                            <p className="text-sm text-gray-500">Kéo thả hoặc <span className="text-primary-600 font-semibold">chọn file</span></p>
                            <p className="text-xs text-gray-400 mt-1">Hỗ trợ: JPG, PNG, PDF — Chọn được nhiều file (Tối đa 50MB)</p>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-primary-50/50 border border-primary-100 rounded-lg px-3 py-2 text-sm">
                                        <span className="text-gray-700 truncate flex-1">📄 {f.name} <span className="text-gray-400">({(f.size / 1024 / 1024).toFixed(2)} MB)</span></span>
                                        <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 ml-2 text-lg leading-none">&times;</button>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-400 text-right">{files.length} file — Tổng: {(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        )}
                    </div>
                    <button type="submit" disabled={submitting}
                        className="btn-press w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50">
                        {submitting ? <><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Đang xử lý...</> : <><span>🚀</span> Gửi đăng ký</>}
                    </button>
                </form>
            </div>
        </div>
    );
}

// ==================== TAB 2: DANH SÁCH ====================
function ListTab({ listData, loadList, userRole, showToast }: { listData: ContractorItem[]; loadList: () => Promise<void>; userRole: UserRole | null; showToast: (m: string, t: string) => void }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (listData.length === 0) doLoad(); }, []);
    async function doLoad() { setLoading(true); await loadList(); setLoading(false); }

    async function handleAction(rowIndex: number, action: string) {
        const labels: Record<string, string> = { Verify: 'xác minh', Approve: 'phê duyệt', Cancel: 'hủy giấy phép', Finish: 'hoàn thành' };
        if (!confirm(`Bạn chắc chắn muốn ${labels[action]} hồ sơ này?`)) return;
        try {
            showToast('Đang xử lý...', 'info');
            const res = await fetch('/api/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rowIndex, action }) });
            const result = await res.json();
            if (result.success) { showToast(result.message, 'success'); doLoad(); }
            else showToast(result.message, 'error');
        } catch (err: any) { showToast('Lỗi: ' + err.message, 'error'); }
    }

    function getActionButtons(item: ContractorItem) {
        const role = userRole?.role;
        const buttons: React.ReactNode[] = [];
        if (role === 'STAFF' && item.trangThai === 'Chờ xác minh')
            buttons.push(<button key="v" onClick={() => handleAction(item.rowIndex, 'Verify')} className="btn-press px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm">✓ Xác minh</button>);
        if (role === 'ADMIN') {
            if (item.trangThai === 'Đã xác minh') buttons.push(<button key="a" onClick={() => handleAction(item.rowIndex, 'Approve')} className="btn-press px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors shadow-sm">✓ Phê duyệt</button>);
            if (item.trangThai !== 'Đã hủy' && item.trangThai !== 'Hoàn thành') buttons.push(<button key="c" onClick={() => handleAction(item.rowIndex, 'Cancel')} className="btn-press px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm">✕ Hủy GP</button>);
            if (item.trangThai === 'Đã phê duyệt') buttons.push(<button key="f" onClick={() => handleAction(item.rowIndex, 'Finish')} className="btn-press px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors shadow-sm">🏁 Finish</button>);
        }
        return buttons.length > 0 ? buttons : <span className="text-xs text-gray-400 italic">—</span>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><span>📋</span> Danh sách đăng ký thi công</h2>
                <button onClick={doLoad} className="btn-press text-sm bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-primary-100 transition-colors flex items-center gap-1.5">🔄 Làm mới</button>
            </div>
            {loading ? <div className="p-12 text-center"><div className="spinner mx-auto mb-3" /><p className="text-gray-400 text-sm">Đang tải danh sách...</p></div> :
                listData.length === 0 ? <div className="p-12 text-center"><div className="text-5xl mb-3">📭</div><p className="text-gray-400 font-medium">Chưa có dữ liệu đăng ký nào</p></div> :
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/80">
                                <tr>{['#', 'Nhà thầu', 'Phòng ban', 'Khu vực', 'Thời gian', 'Trạng thái', 'Tình trạng', 'Hồ sơ', 'Thao tác'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr>
                            </thead>
                            <tbody>
                                {listData.map((item, i) => (
                                    <tr key={item.rowIndex} className="table-row border-b border-gray-50">
                                        <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                                        <td className="px-4 py-3"><div className="font-semibold text-gray-800">{item.tenNhaThau}</div><div className="text-xs text-gray-400 mt-0.5">{item.timestamp}</div></td>
                                        <td className="px-4 py-3 text-gray-600">{item.phongBan}</td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">{item.khuVuc}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{item.tuNgay}<br />→ {item.denNgay}</td>
                                        <td className="px-4 py-3"><StatusBadge status={item.trangThai} /></td>
                                        <td className="px-4 py-3"><TinhTrangBadge tinhTrang={item.tinhTrang} /></td>
                                        <td className="px-4 py-3"><div className="flex gap-1.5">
                                            {item.folderLink && <a href={item.folderLink} target="_blank" className="text-primary-500 hover:text-primary-700 text-lg" title="Folder">📂</a>}
                                            {item.fileLink && <a href={item.fileLink} target="_blank" className="text-primary-500 hover:text-primary-700 text-lg" title="File">📄</a>}
                                        </div></td>
                                        <td className="px-4 py-3"><div className="flex flex-wrap gap-1.5">{getActionButtons(item)}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
        </div>
    );
}

// ==================== TAB 3: TRA CỨU ====================
function SearchTab({ listData, loadList }: { listData: ContractorItem[]; loadList: () => Promise<void> }) {
    const [query, setQuery] = useState('');
    const [data, setData] = useState<ContractorItem[]>(listData);

    useEffect(() => { if (listData.length > 0) setData(listData); }, [listData]);

    useEffect(() => {
        if (!query.trim()) return;
        if (data.length === 0) loadList().then(() => { });
    }, [query]);

    const filtered = query.trim() ? data.filter(item => item.tenNhaThau.toLowerCase().includes(query.toLowerCase())) : [];

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><span>🔍</span> Tra cứu nhà thầu</h2>
                    <div className="relative">
                        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nhập tên nhà thầu cần tra cứu..."
                            className="form-input w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50/50" />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                </div>
                <div className="p-5">
                    {!query.trim() ? <div className="text-center py-8"><div className="text-4xl mb-2">🔎</div><p className="text-gray-400 text-sm">Nhập tên nhà thầu để bắt đầu tra cứu</p></div> :
                        filtered.length === 0 ? <div className="text-center py-8"><div className="text-4xl mb-2">😕</div><p className="text-gray-400 text-sm">Không tìm thấy nhà thầu nào phù hợp</p></div> :
                            filtered.map(item => (
                                <div key={item.rowIndex} className="border border-gray-100 rounded-xl p-4 mb-3 card-hover bg-white">
                                    <div className="flex items-start justify-between gap-4 flex-wrap">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 text-base">{item.tenNhaThau}</h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                                <span>🏢 {item.phongBan}</span><span>📍 {item.khuVuc}</span><span>📅 {item.tuNgay} → {item.denNgay}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1.5">📋 {item.hangMuc}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <StatusBadge status={item.trangThai} /><TinhTrangBadge tinhTrang={item.tinhTrang} />
                                        </div>
                                    </div>
                                    {item.folderLink && <div className="mt-3 pt-3 border-t border-gray-50"><a href={item.folderLink} target="_blank" className="text-xs text-primary-600 hover:text-primary-800 font-medium">📂 Xem hồ sơ →</a></div>}
                                </div>
                            ))}
                </div>
            </div>
        </div>
    );
}

// ==================== TAB 4: YÊU CẦU URC ====================
function UrcTab() {
    const [content, setContent] = useState<string | null>(null);
    useEffect(() => { fetch('/api/urc').then(r => r.json()).then(d => setContent(d.content || '')).catch(() => setContent(null)); }, []);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover">
                <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">📜</span>
                        Yêu cầu &amp; Quy định chung (URC)
                    </h2>
                </div>
                <div className="p-6">
                    {content === null ? <div className="spinner mx-auto" /> :
                        content ? <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line">{content}</div> :
                            <div className="text-center py-8"><div className="text-4xl mb-2">📭</div><p className="text-gray-400">Chưa có nội dung quy định</p></div>}
                </div>
            </div>
        </div>
    );
}

// ==================== SHARED COMPONENTS ====================
function InputField({ label, required, value, onChange, placeholder }: { label: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
            <input type="text" required={required} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="form-input w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50/50" />
        </div>
    );
}

function SelectField({ label, required, value, onChange, options, placeholder, disabled }: { label: string, required?: boolean, value: string, onChange: (v: string) => void, options: string[], placeholder: string, disabled?: boolean }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
            <select
                required={required}
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                className={`form-input w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 bg-gray-50/50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231f2937%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-no-repeat bg-[position:right_1rem_center] ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
            >
                <option value="">{placeholder}</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
}

function ReadOnlyField({ label, value, placeholder, icon }: { label: string; value: string; placeholder: string; icon?: string }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <div className={`w-full px-4 py-2.5 border rounded-xl text-sm ${value ? 'border-primary-200 bg-primary-50/50 text-gray-800 font-medium' : 'border-gray-200 bg-gray-50/50 text-gray-400 italic'}`}>
                {value ? <>{icon && <span className="mr-1.5">{icon}</span>}{value}</> : placeholder}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        'Chờ xác minh': 'bg-amber-100 text-amber-700 border-amber-200',
        'Đã xác minh': 'bg-blue-100 text-blue-700 border-blue-200',
        'Đã phê duyệt': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Đã hủy': 'bg-red-100 text-red-700 border-red-200',
        'Hoàn thành': 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status}</span>;
}

function TinhTrangBadge({ tinhTrang }: { tinhTrang: string }) {
    const map: Record<string, string> = {
        'Đang thi công': 'bg-green-100 text-green-700 border-green-200 badge-pulse',
        'Ngoài thời hạn': 'bg-red-100 text-red-700 border-red-200',
        'Chưa đến hạn thi công': 'bg-sky-100 text-sky-700 border-sky-200',
        'Giấy phép chưa hiệu lực': 'bg-orange-100 text-orange-700 border-orange-200',
        'Đã hủy': 'bg-red-100 text-red-600 border-red-200',
        'Hoàn thành': 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[tinhTrang] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{tinhTrang}</span>;
}

// ==================== UTILS ====================
function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => { const b64 = (reader.result as string).split(',')[1]; resolve(b64); };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
