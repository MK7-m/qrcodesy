import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SectionCard } from '../../components/ui/SectionCard';
import { Input } from '../../components/ui/Input';
import { Database } from '../../lib/database.types';

type Restaurant = Database['public']['Tables']['restaurants']['Row'];

interface QRTabProps {
  restaurant: Restaurant;
}

export function QRTab({ restaurant }: QRTabProps) {
  const [tableCount, setTableCount] = useState(10);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const baseUrl = `${window.location.origin}/menu/${restaurant.id}`;
  const mainUrl = baseUrl;

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const plan = restaurant.plan.toUpperCase() as 'A' | 'B' | 'C';

  return (
    <div className="space-y-6">
      {/* Plan Info */}
      <SectionCard title="خطة المطعم" description={`الخطة الحالية: ${plan}`}>
        <div className="p-4 bg-slate-50 rounded-xl">
          {plan === 'A' && (
            <p className="text-sm text-slate-700">
              <strong>الخطة A:</strong> القائمة الرقمية فقط - يمكن للعملاء تصفح القائمة عبر رمز QR، لكن لا يمكنهم تقديم طلبات.
            </p>
          )}
          {plan === 'B' && (
            <p className="text-sm text-slate-700">
              <strong>الخطة B:</strong> القائمة + طلبات من الطاولة - يمكن للعملاء تصفح القائمة وطلب الطعام من طاولاتهم داخل المطعم.
            </p>
          )}
          {plan === 'C' && (
            <p className="text-sm text-slate-700">
              <strong>الخطة C:</strong> جميع المميزات - القائمة + طلبات من الطاولة + طلبات التوصيل والاستلام.
            </p>
          )}
        </div>
      </SectionCard>

      {/* Main QR */}
      <SectionCard title="رمز QR الرئيسي" description="الرمز الرئيسي للقائمة الرقمية">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
            <QRCodeSVG value={mainUrl} size={200} level="H" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">رابط القائمة</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mainUrl}
                  readOnly
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                  dir="ltr"
                />
                <Button
                  onClick={() => copyToClipboard(mainUrl)}
                  variant={copiedUrl === mainUrl ? 'secondary' : 'primary'}
                  size="md"
                >
                  {copiedUrl === mainUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedUrl === mainUrl ? 'تم النسخ' : 'نسخ'}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                {plan === 'A' && 'هذا الرمز يعرض القائمة الرقمية فقط. العملاء يمكنهم تصفح الأطباق والأسعار.'}
                {plan === 'B' && 'هذا الرمز يعرض القائمة ويمكن للعملاء طلب الطعام من طاولاتهم داخل المطعم.'}
                {plan === 'C' &&
                  'هذا الرمز يعرض القائمة ويدعم جميع أنواع الطلبات: من الطاولة، التوصيل، والاستلام.'}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Table QR Codes (Plan B & C only) */}
      {(plan === 'B' || plan === 'C') && (
        <SectionCard
          title="رموز QR للطاولات"
          description="إنشاء رموز QR مخصصة لكل طاولة للطلبات الداخلية"
        >
          <div className="mb-6">
            <Input
              label="عدد الطاولات"
              type="number"
              value={tableCount.toString()}
              onChange={(e) => setTableCount(Math.max(1, parseInt(e.target.value) || 1))}
              helperText="أدخل عدد الطاولات التي تريد إنشاء رموز QR لها"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: tableCount }, (_, i) => {
              const tableNum = i + 1;
              const tableUrl = `${baseUrl}?table=${tableNum}`;
              const isCopied = copiedUrl === tableUrl;

              return (
                <div key={tableNum} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="text-center mb-3">
                    <h3 className="font-bold text-slate-900 mb-1">طاولة {tableNum}</h3>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 inline-block">
                      <QRCodeSVG value={tableUrl} size={120} level="H" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tableUrl}
                      readOnly
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50"
                      dir="ltr"
                    />
                    <Button
                      onClick={() => copyToClipboard(tableUrl)}
                      variant={isCopied ? 'secondary' : 'primary'}
                      size="sm"
                      fullWidth
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'تم النسخ' : 'نسخ'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>ملاحظة:</strong> كل رمز QR للطاولة يحتوي على رابط مخصص يضيف رقم الطاولة تلقائياً. عندما يمسح العميل الرمز،
              سيتمكن من طلب الطعام مباشرة من طاولته.
            </p>
          </div>
        </SectionCard>
      )}

      {/* Plan A Info */}
      {plan === 'A' && (
        <SectionCard title="معلومات إضافية">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-700">
              مع الخطة A، يمكن للعملاء فقط تصفح القائمة الرقمية. لتفعيل الطلبات من الطاولة، قم بالترقية إلى الخطة B أو C من
              صفحة الإعدادات.
            </p>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

