import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../lib/database.types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SectionCard } from '../../components/ui/SectionCard';
import { CardSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

interface MenuTabProps {
  restaurant: Restaurant;
}

export function MenuTab({ restaurant }: MenuTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadCategories(), loadDishes()]);
    } catch (err) {
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order');

    if (error) {
      console.error('Error loading categories:', error);
      return;
    }

    setCategories(data || []);
    if (data && data.length > 0 && !selectedCategory) {
      setSelectedCategory(data[0].id);
    }
  };

  const loadDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('sort_order');

    if (error) {
      console.error('Error loading dishes:', error);
      return;
    }

    setDishes(data || []);
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع الأطباق المرتبطة به.')) return;

    const { error } = await supabase.from('categories').delete().eq('id', categoryId);

    if (error) {
      alert('حدث خطأ في حذف القسم');
      return;
    }

    loadData();
  };

  const deleteDish = async (dishId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبق؟')) return;

    const { error } = await supabase.from('dishes').delete().eq('id', dishId);

    if (error) {
      alert('حدث خطأ في حذف الطبق');
      return;
    }

    loadDishes();
  };

  const toggleDishAvailability = async (dish: Dish) => {
    const { error } = await supabase.from('dishes').update({ is_available: !dish.is_available }).eq('id', dish.id);

    if (error) {
      alert('حدث خطأ في تحديث حالة الطبق');
      return;
    }

    loadDishes();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  const filteredDishes = selectedCategory ? dishes.filter((d) => d.category_id === selectedCategory) : dishes;

  return (
    <div className="space-y-6">
      {/* Categories */}
      <SectionCard title="الأقسام" description="إدارة أقسام القائمة">
        <div className="mb-4">
          <Button onClick={() => setShowCategoryModal(true)} variant="primary" size="md">
            <Plus className="w-4 h-4" />
            إضافة قسم
          </Button>
        </div>

        {categories.length === 0 ? (
          <p className="text-slate-500 text-center py-8">لا توجد أقسام. أضف قسماً جديداً للبدء.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                  selectedCategory === category.id
                    ? 'border-orange-500 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="p-4 text-center">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{category.name}</h3>
                </div>
                <div className="absolute top-2 left-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                      setShowCategoryModal(true);
                    }}
                    className="p-1.5 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory(category.id);
                    }}
                    className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Dishes */}
      <SectionCard
        title="الأطباق"
        description={selectedCategory ? `أطباق ${categories.find((c) => c.id === selectedCategory)?.name || ''}` : 'جميع الأطباق'}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                !selectedCategory
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <Button onClick={() => setShowDishModal(true)} variant="primary" size="md">
            <Plus className="w-4 h-4" />
            إضافة طبق
          </Button>
        </div>

        {filteredDishes.length === 0 ? (
          <p className="text-slate-500 text-center py-8">لا توجد أطباق في هذا القسم.</p>
        ) : (
          <div className="space-y-3">
            {filteredDishes.map((dish) => {
              const category = categories.find((c) => c.id === dish.category_id);
              return (
                <div
                  key={dish.id}
                  className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                    dish.is_available ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                  }`}
                >
                  {dish.image_url ? (
                    <img src={dish.image_url} alt={dish.name} className="w-24 h-24 object-cover rounded-xl flex-shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-slate-900">{dish.name}</h3>
                      <span className="text-xl font-bold text-orange-600 whitespace-nowrap">{Number(dish.price).toLocaleString()} ر.س</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{dish.description || 'لا يوجد وصف'}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-600">{category?.name || 'غير محدد'}</span>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          dish.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {dish.is_available ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleDishAvailability(dish)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-150"
                      title={dish.is_available ? 'إخفاء' : 'إظهار'}
                    >
                      {dish.is_available ? <Eye className="w-4 h-4 text-slate-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDish(dish);
                        setShowDishModal(true);
                      }}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-150"
                    >
                      <Edit2 className="w-4 h-4 text-slate-600" />
                    </button>
                    <button onClick={() => deleteDish(dish.id)} className="p-2 hover:bg-red-50 rounded-xl transition-all duration-150">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Modals */}
      {showCategoryModal && (
        <CategoryModal
          restaurant={restaurant}
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
            loadCategories();
          }}
        />
      )}

      {showDishModal && (
        <DishModal
          restaurant={restaurant}
          categories={categories}
          dish={editingDish}
          defaultCategoryId={selectedCategory}
          onClose={() => {
            setShowDishModal(false);
            setEditingDish(null);
          }}
          onSave={() => {
            setShowDishModal(false);
            setEditingDish(null);
            loadDishes();
          }}
        />
      )}
    </div>
  );
}

function CategoryModal({
  restaurant,
  category,
  onClose,
  onSave,
}: {
  restaurant: Restaurant;
  category: Category | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(category?.name || '');
  const [nameEn, setNameEn] = useState(category?.name_en || '');
  const [imageUrl, setImageUrl] = useState(category?.image_url || '');
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() || '0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (category) {
      const { error } = await supabase
        .from('categories')
        .update({
          name,
          name_en: nameEn || null,
          image_url: imageUrl || null,
          sort_order: parseInt(sortOrder) || 0,
        })
        .eq('id', category.id);

      if (error) {
        alert('حدث خطأ في تحديث القسم');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('categories').insert({
        restaurant_id: restaurant.id,
        name,
        name_en: nameEn || null,
        image_url: imageUrl || null,
        sort_order: parseInt(sortOrder) || 0,
        is_active: true,
      });

      if (error) {
        alert('حدث خطأ في إضافة القسم');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{category ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="اسم القسم (عربي)" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="اسم القسم (إنجليزي - اختياري)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          <Input label="رابط الصورة (اختياري)" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Input
            label="ترتيب العرض"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            helperText="رقم أقل = يظهر أولاً"
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="secondary" fullWidth>
              إلغاء
            </Button>
            <Button type="submit" loading={loading} variant="primary" fullWidth>
              حفظ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DishModal({
  restaurant,
  categories,
  dish,
  defaultCategoryId,
  onClose,
  onSave,
}: {
  restaurant: Restaurant;
  categories: Category[];
  dish: Dish | null;
  defaultCategoryId: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(dish?.name || '');
  const [nameEn, setNameEn] = useState(dish?.name_en || '');
  const [description, setDescription] = useState(dish?.description || '');
  const [price, setPrice] = useState(dish?.price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(dish?.image_url || '');
  const [categoryId, setCategoryId] = useState(dish?.category_id || defaultCategoryId || categories[0]?.id || '');
  const [isAvailable, setIsAvailable] = useState(dish?.is_available ?? true);
  const [sortOrder, setSortOrder] = useState(dish?.sort_order?.toString() || '0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (dish) {
      const { error } = await supabase
        .from('dishes')
        .update({
          name,
          name_en: nameEn || null,
          description: description || null,
          price: parseFloat(price) || 0,
          image_url: imageUrl || null,
          category_id: categoryId,
          is_available: isAvailable,
          sort_order: parseInt(sortOrder) || 0,
        })
        .eq('id', dish.id);

      if (error) {
        alert('حدث خطأ في تحديث الطبق');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from('dishes').insert({
        restaurant_id: restaurant.id,
        name,
        name_en: nameEn || null,
        description: description || null,
        price: parseFloat(price) || 0,
        image_url: imageUrl || null,
        category_id: categoryId,
        is_available: isAvailable,
        sort_order: parseInt(sortOrder) || 0,
      });

      if (error) {
        alert('حدث خطأ في إضافة الطبق');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{dish ? 'تعديل الطبق' : 'إضافة طبق جديد'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="اسم الطبق (عربي)" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="اسم الطبق (إنجليزي - اختياري)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-150"
              dir="rtl"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="السعر (ل.س)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">القسم</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                required
                dir="rtl"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input label="رابط الصورة (اختياري)" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <Input
            label="ترتيب العرض"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            helperText="رقم أقل = يظهر أولاً"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_available"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-slate-700">
              متوفر اليوم
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="secondary" fullWidth>
              إلغاء
            </Button>
            <Button type="submit" loading={loading} variant="primary" fullWidth>
              حفظ
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

