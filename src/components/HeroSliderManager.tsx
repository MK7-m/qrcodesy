import { useState } from 'react';
import { GripVertical, Trash2, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CoverImage } from '../types/restaurant';
import { uploadHeroImage, deleteHeroImageByUrl } from '../services/storage';
import { normalizeCoverImages, prepareCoverImagesForSave } from '../utils/coverImages';

interface HeroSliderManagerProps {
  restaurantId: string;
  coverImages: CoverImage[] | string[] | null | undefined;
  onUpdate: (images: CoverImage[]) => Promise<void>;
}

interface ImageTileProps {
  image: CoverImage | null;
  index: number;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

function ImageTile({ image, index, onDelete, onMoveUp, onMoveDown, onUpload, isUploading }: ImageTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image ? `image-${index}` : `empty-${index}`,
    disabled: !image || isUploading,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  if (!image) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative aspect-video bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-orange-400 transition-colors"
      >
        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-600">رفع صورة</span>
        </label>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-video bg-white rounded-xl border-2 border-slate-200 overflow-hidden group hover:border-orange-400 transition-colors"
    >
      <img src={image.url} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
      
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors cursor-grab active:cursor-grabbing"
          title="اسحب لإعادة الترتيب"
        >
          <GripVertical className="w-5 h-5 text-slate-600" />
        </button>

        {/* Move up */}
        <button
          onClick={onMoveUp}
          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
          title="نقل لأعلى"
          disabled={index === 0}
        >
          <ChevronUp className="w-5 h-5 text-slate-600" />
        </button>

        {/* Move down */}
        <button
          onClick={onMoveDown}
          className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
          title="نقل لأسفل"
          disabled={index === 9}
        >
          <ChevronDown className="w-5 h-5 text-slate-600" />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="p-2 bg-red-500/90 rounded-lg hover:bg-red-600 transition-colors"
          title="حذف"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Index badge */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  );
}

export function HeroSliderManager({ restaurantId, coverImages: initialCoverImages, onUpdate }: HeroSliderManagerProps) {
  const normalized = normalizeCoverImages(initialCoverImages);
  const [images, setImages] = useState<CoverImage[]>(normalized);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img, idx) => (img ? `image-${idx}` : `empty-${idx}`) === active.id);
    const newIndex = images.findIndex((img, idx) => (img ? `image-${idx}` : `empty-${idx}`) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newImages = arrayMove(images, oldIndex, newIndex);
    setImages(newImages);
    
    const prepared = prepareCoverImagesForSave(newImages);
    await onUpdate(prepared);
  };

  const handleUpload = async (index: number, file: File) => {
    console.log('[HeroSliderManager] Upload requested', { restaurantId, index, fileName: file.name, fileSize: file.size });
    setUploadingIndex(index);
    setError(null);

    try {
      const url = await uploadHeroImage(restaurantId, file, index);
      console.log('[HeroSliderManager] Upload succeeded', { restaurantId, index, url });
      // If replacing existing image, remove old one from storage
      if (images[index]) {
        await deleteHeroImageByUrl(restaurantId, images[index].url);
      }

      const newImages = [...images];
      // If inserting at a position beyond current length, fill with nulls
      while (newImages.length <= index) {
        newImages.push(null as any);
      }
      newImages[index] = { url, order: index };
      
      // Filter out nulls and prepare for save
      const filtered = newImages.filter((img): img is CoverImage => img !== null);
      const prepared = prepareCoverImagesForSave(filtered);
      setImages(prepared);
      await onUpdate(prepared);
    } catch (err) {
      console.error('[HeroSliderManager] Upload failed', err);
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDelete = async (index: number) => {
    if (!images[index]) return;

    const imageToDelete = images[index];
    setError(null);

    console.log('[HeroSliderManager] Delete requested', { restaurantId, index, imageUrl: imageToDelete.url });
    try {
      // Delete from storage
      await deleteHeroImageByUrl(restaurantId, imageToDelete.url);

      // Remove from array
      const newImages = images.filter((_, idx) => idx !== index);
      const prepared = prepareCoverImagesForSave(newImages);
      
      // Update state - keep only actual images
      setImages(prepared);
      await onUpdate(prepared);
    } catch (err) {
      console.error('[HeroSliderManager] Delete failed', err);
      setError(err instanceof Error ? err.message : 'فشل حذف الصورة');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0 || !images[index]) return;

    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    const prepared = prepareCoverImagesForSave(newImages);
    setImages(prepared);
    await onUpdate(prepared);
  };

  const handleMoveDown = async (index: number) => {
    if (index >= images.length - 1 || !images[index]) return;

    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    const prepared = prepareCoverImagesForSave(newImages);
    setImages(prepared);
    await onUpdate(prepared);
  };

  // Ensure we always have 10 slots for display
  const displayImages: (CoverImage | null)[] = [...images];
  while (displayImages.length < 10) {
    displayImages.push(null);
  }

  return (
    <div className="space-y-4" dir="rtl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={displayImages.map((img, idx) => (img ? `image-${idx}` : `empty-${idx}`))} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayImages.map((image, index) => (
              <ImageTile
                key={image ? `image-${index}` : `empty-${index}`}
                image={image}
                index={index}
                onDelete={() => handleDelete(index)}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onUpload={(file) => handleUpload(index, file)}
                isUploading={uploadingIndex === index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-sm text-slate-600">
        يمكنك رفع حتى 10 صور. اسحب الصور لإعادة ترتيبها أو استخدم الأزرار.
      </p>
    </div>
  );
}

