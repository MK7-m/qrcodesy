import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Plus, QrCode, Download, Trash2, Edit2, X, Save } from 'lucide-react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Table = Database['public']['Tables']['tables']['Row'];

interface QRManagementProps {
  restaurant: Restaurant;
}

export function QRManagement({ restaurant }: QRManagementProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);

  const menuUrl = `${window.location.origin}/menu/${restaurant.id}`;

  useEffect(() => {
    loadTables();
  }, [restaurant.id]);

  const loadTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('table_number');

    if (error) {
      console.error('Error loading tables:', error);
      return;
    }

    setTables(data || []);
    setLoading(false);
  };

  const deleteTable = async (tableId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الطاولة؟')) return;

    const { error } = await supabase.from('tables').delete().eq('id', tableId);

    if (error) {
      alert('حدث خطأ في حذف الطاولة');
      return;
    }

    loadTables();
  };

  const generateQRCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  };

  const downloadQR = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">رمز QR الرئيسي للقائمة</h2>
        <p className="text-slate-600 mb-6">هذا الرمز يعرض القائمة الرقمية فقط (الخطة A)</p>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm">
            <img src={generateQRCodeUrl(menuUrl)} alt="Menu QR Code" className="w-48 h-48" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">رابط القائمة</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={menuUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl);
                    alert('تم نسخ الرابط');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
                >
                  نسخ
                </button>
              </div>
            </div>
            <button
              onClick={() => downloadQR(generateQRCodeUrl(menuUrl), `menu-qr-${restaurant.name}.png`)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              تحميل رمز QR
            </button>
          </div>
        </div>
      </div>

      {(restaurant.plan === 'b' || restaurant.plan === 'c') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">رموز QR للطاولات</h2>
              <p className="text-sm text-slate-600 mt-1">للطلب المباشر من الطاولة (الخطة B)</p>
            </div>
            <button
              onClick={() => {
                setEditingTable(null);
                setShowTableModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة طاولة
            </button>
          </div>

          {tables.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              لا توجد طاولات بعد. ابدأ بإضافة طاولة جديدة.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <TableQRCard
                  key={table.id}
                  table={table}
                  restaurant={restaurant}
                  onEdit={() => {
                    setEditingTable(table);
                    setShowTableModal(true);
                  }}
                  onDelete={() => deleteTable(table.id)}
                  onDownload={(url, filename) => downloadQR(url, filename)}
                  generateQRCodeUrl={generateQRCodeUrl}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showTableModal && (
        <TableModal
          restaurant={restaurant}
          table={editingTable}
          onClose={() => {
            setShowTableModal(false);
            setEditingTable(null);
          }}
          onSave={() => {
            setShowTableModal(false);
            setEditingTable(null);
            loadTables();
          }}
        />
      )}
    </div>
  );
}

function TableQRCard({
  table,
  restaurant,
  onEdit,
  onDelete,
  onDownload,
  generateQRCodeUrl,
}: {
  table: Table;
  restaurant: Restaurant;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: (url: string, filename: string) => void;
  generateQRCodeUrl: (text: string) => string;
}) {
  const tableUrl = `${window.location.origin}/menu/${restaurant.id}?table=${table.id}`;
  const qrUrl = generateQRCodeUrl(tableUrl);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-slate-900">طاولة {table.table_number}</h3>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded transition-colors">
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3">
        <img src={qrUrl} alt={`Table ${table.table_number} QR`} className="w-full h-auto" />
      </div>

      <button
        onClick={() => onDownload(qrUrl, `table-${table.table_number}-qr.png`)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        تحميل رمز QR
      </button>
    </div>
  );
}

function TableModal({
  restaurant,
  table,
  onClose,
  onSave,
}: {
  restaurant: Restaurant;
  table: Table | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [tableNumber, setTableNumber] = useState(table?.table_number || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (table) {
      const { error } = await supabase.from('tables').update({ table_number: tableNumber }).eq('id', table.id);

      if (error) {
        alert('حدث خطأ في تحديث الطاولة');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('tables').insert({
        restaurant_id: restaurant.id,
        table_number: tableNumber,
      });

      if (error) {
        alert('حدث خطأ في إضافة الطاولة');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{table ? 'تعديل الطاولة' : 'إضافة طاولة جديدة'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رقم الطاولة</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="مثال: 1 أو A1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
