import React, { useState } from 'react';
import type { UserData, ValueItem } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { connectPartner, logout } from '../services/firebase';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

interface SettingsProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const Settings: React.FC<SettingsProps> = ({ userData, setUserData }) => {
  const [partnerCode, setPartnerCode] = useState('');
  const [message, setMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [isValueModalOpen, setValueModalOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<ValueItem | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCode.trim() || partnerCode.trim() === userData.userId) {
      setMessage('有効なパートナーのコードを入力してください。');
      return;
    };
    setIsConnecting(true);
    const result = await connectPartner(userData.userId, partnerCode.trim());
    setMessage(result.message);
    if(result.success) {
      setUserData(prev => prev ? { ...prev, partnerCode: partnerCode.trim() } : null);
    }
    setIsConnecting(false);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userData.userId);
    alert('あなたのコードをコピーしました！');
  };

  const handleLogout = async () => {
    try {
      await logout();
      // App.tsxのonAuthが発火してuserDataがnullになるため、ここでのsetUserDataは不要
    } catch (error) {
      console.error("Logout failed:", error);
      alert("ログアウトに失敗しました。");
    }
  }
  
  const handleEditValue = (value: ValueItem) => {
    setCurrentValue(value);
    setValueModalOpen(true);
  }
  
  const handleDeleteValue = (id: string) => {
    setUserData(prev => {
        if (!prev) return null;
        const values = prev.values || [];
        return { ...prev, values: values.filter(v => v.id !== id)};
    });
  }
  
  const ValueForm = ({ value, onSave, onCancel }: { value: ValueItem | null, onSave: (value: ValueItem) => void, onCancel: () => void }) => {
    const [text, setText] = useState(value?.text || '');
    const [description, setDescription] = useState(value?.description || '');
    const inputStyle = "mt-1 block w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400";

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      onSave({
        id: value?.id || `value_${Date.now()}`,
        text,
        description,
      });
    }

    return (
       <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">価値観 (例: 成長, 誠実, 自由)</label>
          <input type="text" value={text} onChange={e => setText(e.target.value)} className={inputStyle} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">なぜそれが大切ですか？ (任意)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputStyle} resize-vertical`} rows={3} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
       <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">アプリについて</h2>
          <p className="text-gray-600">
            「Better Double」は、より良いパートナーになるための自己成長をサポートするアプリです。
            共有機能はありますが、主役はあなた自身の成長です。日々の小さな努力を記録し、理想のパートナーシップを築いていきましょう。
          </p>
      </Card>
      
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <SparklesIcon className="h-8 w-8 text-primary-500" />
          <h2 className="text-xl font-bold text-gray-800">価値観ワーク</h2>
        </div>
        <p className="text-gray-600 mb-4">自分が大切にしている価値観を明確にすることで、日々の選択に一貫性が生まれます。これはパートナーには共有されません。</p>
        <div className="space-y-3">
          {(userData.values || []).map(value => (
            <div key={value.id} className="p-3 rounded-lg bg-primary-50/70 group">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-primary-800">{value.text}</p>
                    {value.description && <p className="text-sm text-gray-600 mt-1">{value.description}</p>}
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditValue(value)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-white/50"><PencilIcon className="h-5 w-5"/></button>
                      <button onClick={() => handleDeleteValue(value.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-white/50"><TrashIcon className="h-5 w-5"/></button>
                  </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button onClick={() => { setCurrentValue(null); setValueModalOpen(true); }} className="flex items-center gap-2 mx-auto">
             <PlusIcon className="h-5 w-5" />
            <span>価値観を追加する</span>
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-4 mb-4">
            <UserGroupIcon className="h-8 w-8 text-primary-500"/>
            <h2 className="text-xl font-bold text-gray-800">パートナー連携</h2>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">あなたのコード</h3>
          <p className="text-gray-600 mb-3">このコードをパートナーに教えて連携しましょう。</p>
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg">
            <span className="font-mono text-gray-800 flex-grow break-all">{userData.userId}</span>
            <Button onClick={handleCopyCode} className="text-sm py-1 px-3 flex-shrink-0">コピー</Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">パートナーのコードを入力</h3>
          {userData.partnerCode ? (
            <div>
              <p className="text-primary-600 font-semibold">連携済みです。</p>
              <p className="font-mono text-gray-800 bg-gray-100 p-3 rounded-lg mt-2 break-all">{userData.partnerCode}</p>
            </div>
          ) : (
            <form onSubmit={handleConnect} className="space-y-3">
              <input 
                type="text" 
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                placeholder="パートナーのコード"
                className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400"
              />
              <Button type="submit" disabled={isConnecting}>
                {isConnecting ? '連携中...' : '連携する'}
              </Button>
            </form>
          )}
          {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
        </div>
      </Card>
      
      <Card>
        <Button variant="danger" onClick={handleLogout}>
          ログアウト
        </Button>
      </Card>
      
      <Modal isOpen={isValueModalOpen} onClose={() => setValueModalOpen(false)} title={currentValue ? "価値観を編集" : "価値観を追加"}>
        <ValueForm
            value={currentValue}
            onCancel={() => setValueModalOpen(false)}
            onSave={(value) => {
              setUserData(prev => {
                if (!prev) return null;
                const values = prev.values || [];
                const exists = values.some(v => v.id === value.id);
                return {
                    ...prev,
                    values: exists ? values.map(v => v.id === value.id ? value : v) : [...values, value]
                };
              });
              setValueModalOpen(false);
            }}
        />
      </Modal>
    </div>
  );
};