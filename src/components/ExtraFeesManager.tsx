import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { ExtraFee } from '../types/restaurant';

interface ExtraFeesManagerProps {
  extraFees: ExtraFee[];
  onUpdate: (fees: ExtraFee[]) => void;
}

export function ExtraFeesManager({ extraFees, onUpdate }: ExtraFeesManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editPercentage, setEditPercentage] = useState('');

  const MAX_FEES = 5;

  const handleAdd = () => {
    if (extraFees.length >= MAX_FEES) {
      alert(`يمكنك إضافة حتى ${MAX_FEES} رسوم فقط`);
      return;
    }
    const newFee: ExtraFee = { label: 'رسوم جديدة', percentage: 0 };
    onUpdate([...extraFees, newFee]);
    setEditingIndex(extraFees.length);
    setEditLabel(newFee.label);
    setEditPercentage('0');
  };

  const handleEdit = (index: number) => {
    const fee = extraFees[index];
    setEditingIndex(index);
    setEditLabel(fee.label);
    setEditPercentage(fee.percentage.toString());
  };

  const handleSave = (index: number) => {
    const percentage = parseFloat(editPercentage) || 0;
    if (percentage < 0 || percentage > 100) {
      alert('النسبة يجب أن تكون بين 0 و 100');
      return;
    }
    if (!editLabel.trim()) {
      alert('اسم الرسوم مطلوب');
      return;
    }

    const updated = [...extraFees];
    updated[index] = {
      label: editLabel.trim(),
      percentage,
    };
    onUpdate(updated);
    setEditingIndex(null);
    setEditLabel('');
    setEditPercentage('');
  };

  const handleDelete = (index: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الرسوم؟')) {
      const updated = extraFees.filter((_, i) => i !== index);
      onUpdate(updated);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditLabel('');
    setEditPercentage('');
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">الرسوم الإضافية (حتى {MAX_FEES})</p>
        <button
          onClick={handleAdd}
          disabled={extraFees.length >= MAX_FEES}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          إضافة رسوم
        </button>
      </div>

      {extraFees.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
          <p>لا توجد رسوم إضافية</p>
        </div>
      ) : (
        <div className="space-y-3">
          {extraFees.map((fee, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200"
            >
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      اسم الرسوم
                    </label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                      placeholder="مثال: رسوم تغليف"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      النسبة المئوية (0-100%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editPercentage}
                      onChange={(e) => setEditPercentage(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                      placeholder="5"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(index)}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{fee.label}</div>
                    <div className="text-sm text-slate-600">{fee.percentage}%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

