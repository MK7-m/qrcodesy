import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit, Trash2, Info } from 'lucide-react';
import type { MenuCategory, MenuProduct } from '../../types/menu';
import {
  getCategories,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/menu';
import { DEMO_RESTAURANT, DEMO_RESTAURANT_ID } from '../../data/demoMenu';

function Card({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {actions}
      </div>
      {children}
    </div>
  );
}

function Modal({
  open,
  title,
  onClose,
  children,
  onSubmit,
  submitLabel,
  submitting,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  submitting?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="space-y-3">{children}</div>
        <div className="flex items-center justify-between pt-2">
          <button
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            إلغاء
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 disabled:opacity-50"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? 'جاري الحفظ...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export function MenuPage() {
  const { id } = useParams<{ id: string }>();
  const restaurantId = id || DEMO_RESTAURANT_ID;
  const isDemoPreview = restaurantId === DEMO_RESTAURANT_ID;
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalCategory, setModalCategory] = useState<{ open: boolean; editing?: MenuCategory | null }>({
    open: false,
    editing: null,
  });
  const [modalProduct, setModalProduct] = useState<{ open: boolean; editing?: MenuProduct | null }>({
    open: false,
    editing: null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCategories(restaurantId);
  }, [restaurantId]);

  const loadCategories = async (restaurantId: string) => {
    setLoading(true);
    const data = await getCategories(restaurantId);
    setCategories(data);
    if (data.length && !selectedCategoryId) {
      setSelectedCategoryId(data[0].id);
      loadProducts(data[0].id);
    } else if (selectedCategoryId) {
      loadProducts(selectedCategoryId);
    }
    setLoading(false);
  };

  const loadProducts = async (categoryId: string) => {
    const data = await getProductsByCategory(categoryId);
    setProducts(data);
  };

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const handleSaveCategory = async (name: string) => {
    if (isDemoPreview) {
      setMessage({ type: 'error', text: 'لا يمكن تعديل الفئات أثناء وضع المعاينة. قم بربط Supabase لحفظ التغييرات.' });
      return;
    }
    setSaving(true);
    if (modalCategory.editing) {
      await updateCategory(modalCategory.editing.id, { name });
      setMessage({ type: 'success', text: 'تم تحديث الفئة بنجاح' });
    } else {
      const created = await createCategory({ name, restaurant_id: restaurantId, sort_order: categories.length });
      if (created && !selectedCategoryId) setSelectedCategoryId(created.id);
      setMessage({ type: 'success', text: 'تمت إضافة فئة جديدة' });
    }
    setModalCategory({ open: false, editing: null });
    await loadCategories(restaurantId);
    setSaving(false);
  };
  const handleDeleteCategory = async (catId: string) => {
    if (isDemoPreview) {
      setMessage({ type: 'error', text: 'حذف الفئات غير متاح في وضع البيانات التجريبية.' });
      return;
    }
    await deleteCategory(catId);
    setMessage({ type: 'success', text: 'تم حذف الفئة' });
    if (selectedCategoryId === catId) {
      setSelectedCategoryId(null);
      setProducts([]);
    }
    await loadCategories(restaurantId);
  };
  const handleSaveProduct = async (payload: { name: string; price: number; image_url?: string; description?: string }) => {
    if (!selectedCategoryId) return;
    if (isDemoPreview) {
      setMessage({ type: 'error', text: 'تعديل الأطباق متاح بعد ربط قاعدة البيانات الخاصة بك.' });
      return;
    }
    setSaving(true);
    if (modalProduct.editing) {
      await updateProduct(modalProduct.editing.id, payload);
      setMessage({ type: 'success', text: 'تم تحديث الطبق بنجاح' });
    } else {
      await createProduct({ ...payload, category_id: selectedCategoryId });
      setMessage({ type: 'success', text: 'تمت إضافة طبق جديد' });
    }
    setModalProduct({ open: false, editing: null });
    await loadProducts(selectedCategoryId);
    setSaving(false);
  };
  const handleDeleteProduct = async (productId: string) => {
    if (!selectedCategoryId) return;
    if (isDemoPreview) {
      setMessage({ type: 'error', text: 'حذف الأطباق غير متاح في وضع البيانات التجريبية.' });
      return;
    }
    await deleteProduct(productId);
    setMessage({ type: 'success', text: 'تم حذف الطبق' });
    await loadProducts(selectedCategoryId);
  };
  return (
    <div className="space-y-4" dir="rtl">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 border ${
            message.type === 'success' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {isDemoPreview && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5" />
          <div className="space-y-1 text-right">
            <p className="text-sm font-semibold">وضع المعاينة - {DEMO_RESTAURANT.name}</p>
            <p className="text-xs text-emerald-700">
              يتم عرض البيانات التجريبية نفسها المستخدمة في واجهة العملاء. التعديلات مغلقة هنا إلى أن تربط حساب Supabase الخاص بك.
            </p>
          </div>
        </div>
      )}

      <Card
        title="الأقسام"
        actions={
          <button
            className={`px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 flex items-center gap-2 ${
              isDemoPreview ? 'opacity-50 cursor-not-allowed hover:bg-orange-500' : ''
            }`}
            onClick={() => setModalCategory({ open: true, editing: null })}
            disabled={isDemoPreview}
          >
            <Plus className="w-4 h-4" />
            إضافة قسم
          </button>
        }
      >
        {loading ? (
          <div className="py-6 text-center text-slate-500">جاري التحميل...</div>
        ) : categories.length === 0 ? (
          <div className="py-6 text-center text-slate-500">لا توجد أقسام بعد</div>
        ) : (
          <div className="grid gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                  cat.id === selectedCategoryId ? 'border-orange-300 bg-orange-50' : 'border-slate-200'
                }`}
              >
                <button
                  className="text-right flex-1"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    loadProducts(cat.id);
                  }}
                >
                  <p className="font-semibold text-slate-900">{cat.name}</p>
                  <p className="text-xs text-slate-500">ترتيب: {cat.sort_order ?? 0}</p>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    className={`p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ${
                      isDemoPreview ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''
                    }`}
                    onClick={() => setModalCategory({ open: true, editing: cat })}
                    disabled={isDemoPreview}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 ${
                      isDemoPreview ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''
                    }`}
                    onClick={() => handleDeleteCategory(cat.id)}
                    disabled={isDemoPreview}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="الأطباق"
        actions={
          selectedCategory ? (
            <button
              className={`px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 flex items-center gap-2 ${
                isDemoPreview ? 'opacity-50 cursor-not-allowed hover:bg-orange-500' : ''
              }`}
              onClick={() => setModalProduct({ open: true, editing: null })}
            >
              <Plus className="w-4 h-4" />
              إضافة طبق
            </button>
          ) : null
        }
      >
        {!selectedCategory ? (
          <div className="py-6 text-center text-slate-500">اختر قسمًا لعرض الأطباق</div>
        ) : products.length === 0 ? (
          <div className="py-6 text-center text-slate-500">لا توجد أطباق بعد</div>
        ) : (
          <div className="grid gap-3">
            {products.map((product) => (
              <div key={product.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-sm">بدون صورة</span>
                  )}
                </div>
                <div className="flex-1 text-right">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">{product.description}</p>
                </div>
                <div className="text-orange-600 font-semibold">{product.price} ر.س</div>
                <div className="flex items-center gap-2">
                  <button
                    className={`p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ${
                    isDemoPreview ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''
                  }`}
                    onClick={() => setModalProduct({ open: true, editing: product })}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 ${
                    isDemoPreview ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''
                  }`}
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <CategoryModal
        open={modalCategory.open}
        initial={modalCategory.editing?.name || ''}
        onClose={() => setModalCategory({ open: false, editing: null })}
        onSave={handleSaveCategory}
        submitting={saving}
      />

      <ProductModal
        open={modalProduct.open}
        initial={modalProduct.editing || null}
        onClose={() => setModalProduct({ open: false, editing: null })}
        onSave={handleSaveProduct}
        submitting={saving}
      />
    </div>
  );
}

function CategoryModal({
  open,
  initial,
  onClose,
  onSave,
  submitting,
}: {
  open: boolean;
  initial: string;
  onClose: () => void;
  onSave: (name: string) => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState(initial);

  useEffect(() => setName(initial), [initial, open]);

  return (
    <Modal
      open={open}
      title="القسم"
      onClose={onClose}
      onSubmit={() => onSave(name)}
      submitLabel="حفظ"
      submitting={submitting}
    >
      <Input label="اسم القسم" value={name} onChange={setName} placeholder="مثال: السلطات" />
    </Modal>
  );
}

function ProductModal({
  open,
  initial,
  onClose,
  onSave,
  submitting,
}: {
  open: boolean;
  initial: MenuProduct | null;
  onClose: () => void;
  onSave: (payload: { name: string; price: number; image_url?: string; description?: string }) => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price?.toString() || '0');
  const [image, setImage] = useState(initial?.image_url || '');
  const [description, setDescription] = useState(initial?.description || '');

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setPrice(initial?.price?.toString() || '0');
      setImage(initial?.image_url || '');
      setDescription(initial?.description || '');
    }
  }, [open, initial]);

  return (
    <Modal
      open={open}
      title="الطبق"
      onClose={onClose}
      onSubmit={() => onSave({ name, price: Number(price) || 0, image_url: image, description })}
      submitLabel="حفظ"
      submitting={submitting}
    >
      <div className="grid gap-3">
        <Input label="اسم الطبق" value={name} onChange={setName} placeholder="مثال: تبولة" />
        <Input label="السعر" value={price} onChange={setPrice} type="number" placeholder="0" />
        <Input label="صورة (URL)" value={image} onChange={setImage} placeholder="https://..." />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">وصف</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="أدخل الوصف"
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
}

export default MenuPage;
