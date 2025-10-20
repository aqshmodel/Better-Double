import React, { useState } from 'react';
import * as db from '../services/firebase';
import { Card } from './common/Card';
import { Button } from './common/Button';
import type { AuthError } from 'firebase/auth';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (isLogin) {
        await db.signInWithEmail(email, password);
      } else {
        await db.signUpWithEmail(email, password);
      }
    } catch (err) {
      const authError = err as AuthError;
      switch (authError.code) {
        case 'auth/user-not-found':
          setError('メールアドレスが見つかりません。');
          break;
        case 'auth/wrong-password':
          setError('パスワードが間違っています。');
          break;
        case 'auth/email-already-in-use':
          setError('このメールアドレスは既に使用されています。');
          break;
        case 'auth/weak-password':
           setError('パスワードは6文字以上で入力してください。');
           break;
        default:
          setError('エラーが発生しました。もう一度お試しください。');
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await db.signInWithGoogle();
    } catch (err) {
      setError('Googleサインインに失敗しました。');
    }
  };
  
  const inputStyle = "mt-1 block w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-primary-600 mb-4">
          Better Double
        </h1>
        <p className="text-center text-gray-600 mb-8">
          パートナーシップを育む、新しい自己成長の形
        </p>
        <Card>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">
            {isLogin ? 'ログイン' : '新規登録'}
          </h2>
          <form onSubmit={handleAuthAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputStyle}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '処理中...' : (isLogin ? 'ログイン' : '登録する')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
                Googleでサインイン
              </Button>
            </div>
          </div>
          
          <p className="mt-6 text-center text-sm">
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary-600 hover:text-primary-500">
              {isLogin ? 'アカウントをお持ちでないですか？' : '既にアカウントをお持ちですか？'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;