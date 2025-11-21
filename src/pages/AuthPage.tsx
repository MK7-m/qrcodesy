import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LogIn, UserPlus, ShieldCheck, Star, Timer, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const heroStats = [
    { label: 'طلبات اليوم', value: '128+', helper: 'نمو 12٪ هذا الأسبوع' },
    { label: 'مطاعم نشطة', value: '42', helper: 'في السعودية والخليج' },
    { label: 'زمن التحضير', value: '14 دقيقة', helper: 'تنبيهات تلقائية' },
    { label: 'رضا الضيوف', value: '4.9/5', helper: 'بناءً على ٢٣٠٠ تقييم' },
  ];

  const highlights: { icon: LucideIcon; title: string; description: string }[] = [
    {
      icon: ShieldCheck,
      title: 'دعم كامل للعربية',
      description: 'لوحة تحكم مترجمة بالكامل مع صلاحيات مخصصة للفريق وسجل لحظي للطلبات.',
    },
    {
      icon: Timer,
      title: 'تنبيهات فورية',
      description: 'إشعارات ذكية للطلبات المتأخرة ورسائل جاهزة للمطبخ والدليفري.',
    },
    {
      icon: Star,
      title: 'تجربة ضيوف مذهلة',
      description: 'قوائم QR محدثة بالصور والخيارات الإضافية وعروض وقتية مفلترة.',
    },
  ];

  const testimonials = [
    {
      quote: 'منذ أن استخدمنا QRCodesy أصبحت متابعة الصالة والمطبخ أسهل، والضيوف يحبون الواجهة الجديدة.',
      author: 'مطعم ليالي جدة',
      role: 'المالك أحمد القحطاني',
    },
    {
      quote: 'أتابع الطلبات من الجوال أثناء الذروة وكل الأجهزة متزامنة بدون أي تأخير.',
      author: 'مطعم بهارات الشرقية',
      role: 'المديرة هناء التركي',
    },
  ];

  const demoCredentials = {
    email: 'demo@qrcodesy.com',
    password: 'demo-restaurant',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm text-orange-600 font-semibold tracking-[0.3em]">QRCodesy</p>
          <h1 className="text-3xl font-semibold text-slate-900">
            منصة إدارة الطلبات العربية للمطاعم الذكية
          </h1>
          <p className="text-base text-slate-600 max-w-3xl mx-auto">
            انطلق في دقائق مع قوائم QR تفاعلية، متابعة لحظية للطلبات، وتجربة ضيوف مبهرة. كل ذلك مهيأ للغة العربية
            وبيئة العمل في الخليج.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <section className="space-y-6">
            <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-44 bg-gradient-to-t from-orange-200/40 to-transparent blur-3xl opacity-70 pointer-events-none" />
              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  معتمد من أكثر من ٤٠ مطعماً نشطاً
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  تجربة مرنة للمطابخ، الاستقبال، والتوصيل
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  اجمع إدارة الطاولات، تنبيهات التوصيل، ومراقبة الطلبات في لوحة واضحة. يدعم التطبيق جميع أجهزة
                  التابلت والهواتف ويولّد تقارير يومية تلقائياً.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-right shadow-sm"
                    >
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm font-medium text-slate-700">{stat.label}</p>
                      <p className="text-xs text-slate-500">{stat.helper}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">
              <div className="flex flex-col gap-4">
                {highlights.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex items-start gap-3 text-right">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-slate-100 text-orange-600 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {testimonials.map((item) => (
                  <div key={item.author} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                    <p className="text-sm text-slate-700 leading-relaxed">“{item.quote}”</p>
                    <div className="text-xs text-slate-500">
                      <p className="font-semibold text-slate-900">{item.author}</p>
                      <p>{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 bg-slate-100 rounded-full p-1 flex">
                <button
                  type="button"
                  aria-pressed={!isSignUp}
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                  }}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    !isSignUp ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  aria-pressed={isSignUp}
                  onClick={() => {
                    setIsSignUp(true);
                    setError('');
                  }}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isSignUp ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                  }`}
                >
                  إنشاء حساب
                </button>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              </div>
            </div>

            <div className="space-y-1 text-right">
              <h2 className="text-xl font-semibold text-slate-900">
                {isSignUp ? 'أنشئ حساب المطعم في أقل من دقيقة' : 'ادخل إلى لوحة المتابعة فوراً'}
              </h2>
              <p className="text-sm text-slate-600">
                {isSignUp
                  ? 'أدخل البريد الرسمي لإرسال دعوة التفعيل مع ربط حساب Supabase الخاص بك.'
                  : 'استخدم بيانات الاعتماد الخاصة بمطعمك أو جرب الحساب التجريبي لمشاهدة اللوحة.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                autoComplete="email"
                label="البريد الإلكتروني الرسمي"
                placeholder="manager@restaurant.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                helperText={isSignUp ? 'سنعتمد هذا البريد لإرسال رابط التفعيل والفواتير.' : 'استخدم البريد المرتبط بعضويتك.'}
              />

              <Input
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                label="كلمة المرور"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                helperText="٦ أحرف على الأقل مع أرقام أو رموز."
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-600 text-right">
                  {error}
                </div>
              )}

              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 space-y-2 text-right">
                <p className="text-sm font-semibold text-slate-800">بيانات الدخول التجريبية</p>
                <p className="text-xs text-slate-500">يمكنك استخدامها لتجربة الواجهة قبل ربط حسابك الحقيقي.</p>
                <div className="font-mono text-sm text-slate-700 bg-white rounded-xl p-3 space-y-2 border border-slate-200" dir="rtl">
                  <div className="flex items-center justify-between flex-row-reverse gap-4">
                    <span className="text-slate-500">Email</span>
                    <span>{demoCredentials.email}</span>
                  </div>
                  <div className="flex items-center justify-between flex-row-reverse gap-4">
                    <span className="text-slate-500">Password</span>
                    <span>{demoCredentials.password}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                {isSignUp ? 'متابعة إنشاء الحساب' : 'تسجيل الدخول'}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              {isSignUp ? (
                <span>
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-orange-600 font-semibold hover:text-orange-700"
                  >
                    سجل دخولك من هنا
                  </button>
                </span>
              ) : (
                <span>
                  لا يوجد حساب لمطعمك؟{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-orange-600 font-semibold hover:text-orange-700"
                  >
                    قم بإنشاء حساب جديد
                  </button>
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
