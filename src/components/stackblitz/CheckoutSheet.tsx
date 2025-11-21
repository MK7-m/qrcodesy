// src/components/CheckoutSheet.tsx
import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import type { OrderMode } from './CartSheet';
import { formatPrice } from '../types/formatPrice';

interface CheckoutSheetProps {
  mode: OrderMode;
  cartTotal: number;
  deliveryFee: number;
  orderTotal: number;
  onClose: () => void;
  /** Optional: if you want to receive the payload, you can handle it in App */
  onConfirm?: (payload: {
    mode: OrderMode;
    tableNumber?: string;
    name?: string;
    phone?: string;
    address?: string;
  }) => void;
}

export const CheckoutSheet: React.FC<CheckoutSheetProps> = ({
  mode,
  cartTotal,
  deliveryFee,
  orderTotal,
  onClose,
  onConfirm,
}) => {
  const isDineIn = mode === 'dine-in';
  const totalSteps = isDineIn ? 1 : 2;

  const [step, setStep] = useState<number>(1);

  // Form state
  const [tableNumber, setTableNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // ========= Labels & copy =========

  const modeTitle =
    mode === 'dine-in'
      ? 'طلب داخلي'
      : mode === 'delivery'
      ? 'توصيل'
      : 'استلام من المحل';

  const modeDescription =
    mode === 'dine-in'
      ? 'سيتم تجهيز طلبك وتقديمه على طاولتك داخل المطعم.'
      : mode === 'delivery'
      ? 'سيتم توصيل طلبك إلى العنوان الذي ستقوم بإدخاله في الخطوة التالية.'
      : 'سيتم تجهيز طلبك للاستلام من المحل. سنستخدم معلوماتك للتواصل عند الحاجة.';

  const reviewDescription =
    mode === 'delivery'
      ? 'راجع معلوماتك وقيمة الطلب وأجرة التوصيل قبل الإرسال.'
      : 'راجع معلوماتك وقيمة الطلب قبل الإرسال.';

  // ========= Validation =========

  const canContinueStep1 = (() => {
    if (isDineIn) return tableNumber.trim().length > 0;
    if (mode === 'delivery')
      return (
        name.trim().length > 1 &&
        phone.trim().length > 5 &&
        address.trim().length > 4
      );
    // pickup
    return name.trim().length > 1 && phone.trim().length > 5;
  })();

  const handlePrimaryClick = () => {
    if (isDineIn) {
      // one-step flow
      const payload = { mode, tableNumber };
      if (onConfirm) onConfirm(payload);
      onClose();
      return;
    }

    if (step === 1) {
      if (!canContinueStep1) return;
      setStep(2);
      return;
    }

    // step 2 = confirm
    const payload = { mode, tableNumber, name, phone, address };
    if (onConfirm) onConfirm(payload);
    onClose();
  };

  const primaryLabel = (() => {
    if (isDineIn) return 'تأكيد الطلب';
    return step === 1 ? 'المتابعة' : 'تأكيد وإرسال الطلب';
  })();

  // ========= Render =========

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center pointer-events-none">
      {/* Gray overlay below header */}
      <div className="modal-overlay-below-header" onClick={onClose} />

      {/* Sheet container */}
      <div className="pointer-events-auto w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-black/25 md:rounded-3xl flex flex-col max-h-[85vh] relative z-50">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between" dir="rtl">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900">
              إنهاء الطلب
            </h3>
            <p className="text-[11px] text-slate-500">
              الخطوة {step} من {totalSteps}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="mb-3" dir="rtl">
          {isDineIn ? (
            <div className="checkout-steps">
              <div className="checkout-step checkout-step--active">
                <span className="checkout-step-number">1</span>
                <span className="checkout-step-label">تفاصيل الطلب</span>
              </div>
            </div>
          ) : (
            <div className="checkout-steps">
              <div
                className={
                  'checkout-step ' + (step === 1 ? 'checkout-step--active' : '')
                }
              >
                <span className="checkout-step-number">1</span>
                <span className="checkout-step-label">معلومات الطلب</span>
              </div>
              <div
                className={
                  'checkout-step ' + (step === 2 ? 'checkout-step--active' : '')
                }
              >
                <span className="checkout-step-number">2</span>
                <span className="checkout-step-label">مراجعة وارسال</span>
              </div>
            </div>
          )}
        </div>

        {/* Mode text */}
        <div className="mb-3 space-y-1 text-right" dir="rtl">
          <p className="text-xs font-semibold text-slate-900">{modeTitle}</p>
          <p className="text-[11px] leading-relaxed text-slate-600">
            {step === 1 ? modeDescription : reviewDescription}
          </p>
        </div>

        {/* Content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-2"
          dir="rtl"
        >
          {/* Step 1: forms */}
          {step === 1 && (
            <div className="space-y-3">
              {isDineIn && (
                <div className="space-y-1.5">
                  <label className="checkout-label">رقم الطاولة</label>
                  <input
                    type="text"
                    className="checkout-input"
                    placeholder="أدخل رقم الطاولة (مثال: 5 أو A3)"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
              )}

              {!isDineIn && (
                <>
                  <div className="space-y-1.5">
                    <label className="checkout-label">الاسم</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="الاسم الثلاثي"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="checkout-label">رقم الموبايل</label>
                    <input
                      type="tel"
                      className="checkout-input"
                      placeholder="09XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {mode === 'delivery' && (
                    <div className="space-y-1.5">
                      <label className="checkout-label">العنوان</label>
                      <textarea
                        rows={2}
                        className="checkout-input resize-none"
                        placeholder="مثال: المزة – جانب القصور – بناء رقم ..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: review */}
          {!isDineIn && step === 2 && (
            <div className="space-y-3 text-right">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">نوع الطلب</span>
                  <span>
                    {mode === 'delivery'
                      ? 'توصيل'
                      : mode === 'pickup'
                      ? 'استلام من المحل'
                      : 'طلب داخلي'}
                  </span>
                </div>

                {name && (
                  <div className="flex items-center justify-between">
                    <span>الاسم</span>
                    <span>{name}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center justify-between">
                    <span>الموبايل</span>
                    <span>{phone}</span>
                  </div>
                )}
                {mode === 'delivery' && address && (
                  <div className="flex flex-col gap-1">
                    <span>العنوان</span>
                    <span className="text-[11px] text-slate-600">
                      {address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary (always visible in checkout) */}
          <div className="mt-2 space-y-1 text-[11px] text-slate-700 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span>المجموع الفرعي</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>أجرة التوصيل</span>
              <span>
                {mode === 'delivery' ? formatPrice(deliveryFee) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>الإجمالي</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-3 flex items-center gap-3" dir="rtl">
          {!isDineIn && step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowRight className="h-3 w-3" />
              <span>رجوع</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrimaryClick}
            disabled={!canContinueStep1 && step === 1}
            className={
              'cart-continue-btn flex-1 ' +
              (!canContinueStep1 && step === 1
                ? 'cart-continue-btn--disabled'
                : '')
            }
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
