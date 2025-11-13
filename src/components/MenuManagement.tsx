import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Plus, Edit2, Trash2, Image, X, Save, Eye, EyeOff } from 'lucide-react';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Dish = Database['public']['Tables']['dishes']['Row'];

interface MenuManagementProps {
  restaurant: Restaurant;
}

export function MenuManagement({ restaurant }: MenuManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadDishes();
  }, [restaurant.id]);

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
    setLoading(false);
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

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      alert('حدث خطأ في حذف القسم');
      return;
    }

    loadCategories();
    loadDishes();
  };

  const deleteDish = async (dishId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطبق؟')) return;

    const { error } = await supabase
      .from('dishes')
      .delete()
      .eq('id', dishId);

    if (error) {
      alert('حدث خطأ في حذف الطبق');
      return;
    }

    loadDishes();
  };

  const toggleDishAvailability = async (dish: Dish) => {
    const { error } = await supabase
      .from('dishes')
      .update({ is_available: !dish.is_available })
      .eq('id', dish.id);

    if (error) {
      alert('حدث خطأ في تحديث حالة الطبق');
      return;
    }

    loadDishes();
  };

  const filteredDishes = selectedCategory
    ? dishes.filter((d) => d.category_id === selectedCategory)
    : dishes;

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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">الأقسام</h2>
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة قسم
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            لا توجد أقسام بعد. ابدأ بإضافة قسم جديد.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                onEdit={() => {
                  setEditingCategory(category);
                  setShowCategoryModal(true);
                }}
                onDelete={() => deleteCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">الأطباق</h2>
            {selectedCategory && (
              <p className="text-sm text-slate-600 mt-1">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setEditingDish(null);
              setShowDishModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة طبق
          </button>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            {selectedCategory
              ? 'لا توجد أطباق في هذا القسم بعد.'
              : 'لا توجد أطباق بعد. ابدأ بإضافة طبق جديد.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                categoryName={categories.find((c) => c.id === dish.category_id)?.name || ''}
                onEdit={() => {
                  setEditingDish(dish);
                  setShowDishModal(true);
                }}
                onDelete={() => deleteDish(dish.id)}
                onToggleAvailability={() => toggleDishAvailability(dish)}
              />
            ))}
          </div>
        )}
      </div>

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

function CategoryCard({
  category,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`relative rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
        isSelected ? 'border-orange-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div onClick={onClick} className="p-4 text-center">
        {category.image_url ? (
          <img src={category.image_url} alt={category.name} className="w-full h-24 object-cover rounded-lg mb-2" />
        ) : (
          <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
            <Image className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <h3 className="font-semibold text-slate-900 text-sm truncate">{category.name}</h3>
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1.5 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-sm transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
        </button>
      </div>
    </div>
  );
}

function DishCard({
  dish,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailability,
}: {
  dish: Dish;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}) {
  return (
    <div className={`flex gap-4 p-4 rounded-lg border transition-all ${dish.is_available ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'}`}>
      {dish.image_url ? (
        <img src={dish.image_url} alt={dish.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
      ) : (
        <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
          <Image className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900">{dish.name}</h3>
          <span className="text-lg font-bold text-orange-600 whitespace-nowrap">{dish.price} ل.س</span>
        </div>
        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{dish.description || 'لا يوجد وصف'}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 bg-slate-100 rounded">{categoryName}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={onToggleAvailability} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={dish.is_available ? 'إخفاء' : 'إظهار'}>
          {dish.is_available ? <Eye className="w-4 h-4 text-slate-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
        </button>
        <button onClick={onEdit} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Edit2 className="w-4 h-4 text-slate-600" />
        </button>
        <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (category) {
      const { error } = await supabase
        .from('categories')
        .update({ name, name_en: nameEn || null, image_url: imageUrl || null })
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
        sort_order: 0,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{category ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم القسم (عربي)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="مثال: المشروبات"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم القسم (إنجليزي - اختياري)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Example: Drinks"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رابط الصورة (اختياري)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://example.com/image.jpg"
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert('يرجى اختيار قسم للطبق');
      return;
    }

    setLoading(true);

    if (dish) {
      const { error } = await supabase
        .from('dishes')
        .update({
          name,
          name_en: nameEn || null,
          description: description || null,
          price: parseFloat(price),
          image_url: imageUrl || null,
          category_id: categoryId,
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
        category_id: categoryId,
        name,
        name_en: nameEn || null,
        description: description || null,
        price: parseFloat(price),
        image_url: imageUrl || null,
        sort_order: 0,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{dish ? 'تعديل الطبق' : 'إضافة طبق جديد'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم الطبق (عربي)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="مثال: شاورما عربي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم الطبق (إنجليزي - اختياري)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Example: Arabic Shawarma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الوصف (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="وصف مختصر للطبق..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">السعر (ل.س)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">القسم</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رابط الصورة (اختياري)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="https://example.com/image.jpg"
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
