import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  requireLoginForReading?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  requireLoginForReading = false,
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, authError, clearAuthError, continueAsGuest } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FDFBF7] rounded-2xl shadow-xl border border-[#E8DEC8] p-6 text-right overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-[#8C6D37] hover:bg-[#E8DEC8]/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1B4332] text-[#C4A674] mb-3 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#1B4332]">
            {mode === 'signin' && 'تسجيل الدخول'}
            {mode === 'signup' && 'إنشاء حساب جديد'}
            {mode === 'forgot' && 'استعادة كلمة المرور'}
          </h2>
          <p className="text-xs text-[#556B2F] mt-1">
            {mode === 'signin' && 'سجّل دخولك لمزامنة وردك القرآني عبر جميع أجهزتك'}
            {mode === 'signup' && 'ابدأ رحلة بناء عادك اليومية مع كتاب الله'}
            {mode === 'forgot' && 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين'}
          </p>
        </div>

        {/* Pre-reading login explanation banner */}
        {requireLoginForReading && mode !== 'forgot' && (
          <div className="mb-4 p-3 rounded-xl bg-[#1B4332]/8 border border-[#C4A674]/60 text-[#1B4332] text-xs leading-relaxed">
            <span className="font-bold block mb-0.5">تسجيل الدخول مطلوب قبل القراءة</span>
            <span className="text-[#556B2F]">
              سجّل دخولك لنحفظ لك وقت القراءة، علامة الصح على أيامك، وآخر صفحة توقفت عندها تلقائياً.
            </span>
          </div>
        )}

        {/* Error message */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{authError}</span>
          </div>
        )}

        {/* Reset Success Message */}
        {resetSent && mode === 'forgot' ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#1B4332] text-sm mb-1">تم إرسال رابط الاستعادة</h3>
            <p className="text-xs text-[#556B2F] mb-4">تفقد صندوق بريدك الإلكتروني لتعيين كلمة مرور جديدة.</p>
            <button
              onClick={() => {
                setResetSent(false);
                setMode('signin');
              }}
              className="text-xs font-semibold text-[#1B4332] underline"
            >
              العودة لتسجيل الدخول
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[#1B4332] mb-1">الاسم أو اللقب</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: عبد الله"
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-[#E8DEC8] text-sm text-[#1F2421] focus:outline-none focus:border-[#1B4332] transition-colors"
                  />
                  <User className="w-4 h-4 text-[#8C6D37] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#1B4332] mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  dir="ltr"
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-[#E8DEC8] text-sm text-[#1F2421] text-right focus:outline-none focus:border-[#1B4332] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#8C6D37] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-[#1B4332]">كلمة المرور</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-[#8C6D37] hover:underline"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-[#E8DEC8] text-sm text-[#1F2421] text-right focus:outline-none focus:border-[#1B4332] transition-colors"
                  />
                  <Lock className="w-4 h-4 text-[#8C6D37] absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#16382B] text-[#FAF7F0] text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span>جارِ المعالجة...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'تسجيل الدخول'}
                    {mode === 'signup' && 'إنشاء الحساب'}
                    {mode === 'forgot' && 'إرسال رابط الاستعادة'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        {mode !== 'forgot' && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8DEC8]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-[#FDFBF7] px-2 text-[#8C6D37]">أو</span>
            </div>
          </div>
        )}

        {/* Google sign-in */}
        {mode !== 'forgot' && (
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2 rounded-xl bg-white hover:bg-gray-50 border border-[#E8DEC8] text-xs font-semibold text-[#1F2421] transition-all flex items-center justify-center gap-2 mb-3 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>متابعة باستخدام حساب Google</span>
          </button>
        )}

        {/* Footer switch */}
        <div className="text-center text-xs text-[#556B2F] mt-3">
          {mode === 'signin' && (
            <p>
              ليس لديك حساب بعد؟{' '}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setMode('signup');
                }}
                className="font-bold text-[#1B4332] hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              لديك حساب بالفعل؟{' '}
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setMode('signin');
                }}
                className="font-bold text-[#1B4332] hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                clearAuthError();
                setMode('signin');
              }}
              className="font-bold text-[#1B4332] hover:underline"
            >
              العودة لتسجيل الدخول
            </button>
          )}

          {/* Continue as guest (only when not gated for reading) */}
          {!requireLoginForReading && (
            <div className="mt-3 pt-2 border-t border-[#E8DEC8]/50">
              <button
                type="button"
                onClick={() => {
                  continueAsGuest();
                  onClose();
                }}
                className="text-[11px] text-[#8C6D37] hover:text-[#1B4332] hover:underline"
              >
                المتابعة كضيف دون تسجيل (حفظ محلي في هذا المتصفح)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
