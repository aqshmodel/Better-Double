import React, { useState } from 'react';
import type { UserData, DatePlan, Wish } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ArrowUpCircleIcon } from './icons/ArrowUpCircleIcon';


interface PlannerProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  partnerData: UserData | null;
}

export const Planner: React.FC<PlannerProps> = ({ userData, setUserData, partnerData }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'wishes'>('plans');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<DatePlan | null>(null);
  const [modalInitialTitle, setModalInitialTitle] = useState('');
  const [newWishText, setNewWishText] = useState('');

  const inputStyle = "mt-1 block w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400";
  const textareaStyle = `${inputStyle} resize-vertical`;

  const handleSavePlan = (plan: DatePlan) => {
    setUserData(prev => {
      if (!prev) return null;
      const exists = prev.datePlans.some(p => p.id === plan.id);
      const newPlans = exists 
        ? prev.datePlans.map(p => p.id === plan.id ? plan : p)
        : [...prev.datePlans, plan];
      return { ...prev, datePlans: newPlans };
    });
    setModalOpen(false);
    setModalInitialTitle('');
    setCurrentPlan(null);
  };
  
  const handleEditPlan = (plan: DatePlan) => {
    setCurrentPlan(plan);
    setModalOpen(true);
  }

  const handleDeletePlan = (id: string) => {
     setUserData(prev => prev ? { ...prev, datePlans: prev.datePlans.filter(p => p.id !== id) } : null);
  }
  
  const handleToggleComplete = (id: string) => {
      setUserData(prev => prev ? {
      ...prev,
      datePlans: prev.datePlans.map(p => p.id === id ? { ...p, completed: !p.completed } : p)
    } : null);
  }
  
  const handleAddWish = () => {
    if (!newWishText.trim()) return;
    const newWish: Wish = {
      id: `wish_${Date.now()}_${userData.userId}`,
      text: newWishText.trim(),
      authorId: userData.userId,
      createdAt: new Date().toISOString(),
      isPlanned: false,
    };
    setUserData(prev => {
      if (!prev) return null;
      const updatedWishes = [...(prev.wishes || []), newWish];
      return { ...prev, wishes: updatedWishes };
    });
    setNewWishText('');
  };

  const handleDeleteWish = (id: string) => {
    setUserData(prev => {
      if (!prev) return null;
      const updatedWishes = (prev.wishes || []).filter(wish => wish.id !== id);
      return { ...prev, wishes: updatedWishes };
    });
  };

  const handlePlanFromWish = (wish: Wish) => {
    setModalInitialTitle(wish.text);
    setCurrentPlan(null);
    setModalOpen(true);
    setActiveTab('plans'); // 計画タブに移動
  }


  const PlanForm = ({ plan, onSave, onCancel, initialTitle }: { plan: DatePlan | null, onSave: (plan: DatePlan) => void, onCancel: () => void, initialTitle?: string }) => {
    const [title, setTitle] = useState(plan?.title || initialTitle || '');
    const [date, setDate] = useState(plan?.date || new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState(plan?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        id: plan?.id || `plan_${Date.now()}`,
        title,
        date,
        description,
        completed: plan?.completed || false,
        authorId: userData.userId,
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">予定のタイトル</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">日付</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className={inputStyle}
            style={{ colorScheme: 'light' }}
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">詳細 (任意)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={textareaStyle} rows={3} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">計画する</Button>
        </div>
      </form>
    );
  };
  
  const allWishes = [...(userData.wishes || []), ...(partnerData?.wishes || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const allPlans = [...userData.datePlans.map(p => ({ ...p, authorId: p.authorId || userData.userId })), ...(partnerData?.datePlans.map(p => ({ ...p, authorId: p.authorId || partnerData.userId })) || [])];
  const upcomingPlans = allPlans.filter(p => !p.completed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastPlans = allPlans.filter(p => p.completed).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderPlansContent = () => (
    <div className="space-y-6">
       <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">ふたりの時間</h2>
          <Button onClick={() => { setModalInitialTitle(''); setCurrentPlan(null); setModalOpen(true); }} className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            <span>計画する</span>
          </Button>
        </div>
        <p className="text-gray-600">一緒に過ごす時間をデザインしましょう。小さなことでも、計画することで楽しみが倍増します。</p>
      </Card>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-700 px-1 mb-2">これからの予定</h3>
        {upcomingPlans.length === 0 && <Card><p className="text-gray-500 text-center py-4">新しい予定を計画しましょう！</p></Card>}
        {upcomingPlans.map(plan => (
          <Card key={plan.id} className={`mb-4 relative ${plan.authorId !== userData.userId ? 'border-primary-200 border' : ''}`}>
            {plan.authorId !== userData.userId && (
              <span title="パートナーの予定" className="absolute top-3 right-3 bg-accent-200 text-accent-800 text-xs font-bold px-2 py-1 rounded-full">Partner</span>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-accent-700">{plan.title}</h4>
                <p className="text-sm text-gray-600">{new Date(plan.date).toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                {plan.description && <p className="mt-2 text-gray-700 whitespace-pre-wrap">{plan.description}</p>}
              </div>
              {plan.authorId === userData.userId && (
                <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                  <button onClick={() => handleToggleComplete(plan.id)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100" title="完了する"><CheckCircleIcon className="h-5 w-5"/></button>
                  <button onClick={() => handleEditPlan(plan)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100" title="編集"><PencilIcon className="h-5 w-5"/></button>
                  <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50" title="削除"><TrashIcon className="h-5 w-5"/></button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 px-1 mb-2">思い出</h3>
         {pastPlans.length === 0 && <Card><p className="text-gray-500 text-center py-4">完了した予定はここに表示されます。</p></Card>}
        {pastPlans.map(plan => (
          <Card key={plan.id} className="mb-4 bg-stone-50">
             <div className="flex items-start gap-4">
                <CheckCircleIcon className="h-6 w-6 text-primary-400 mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-gray-700">{plan.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(plan.date).toLocaleDateString('ja-JP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {plan.description && <p className="mt-2 text-gray-600 whitespace-pre-wrap">{plan.description}</p>}
                </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderWishesContent = () => (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-4">ふたりのウィッシュリスト</h2>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-4">
        {allWishes.length === 0 && <p className="text-gray-500 text-sm text-center py-2">まだウィッシュはありません。</p>}
        {allWishes.map(wish => (
          <div key={wish.id} className={`p-3 rounded-lg flex justify-between items-center ${wish.authorId === userData.userId ? 'bg-primary-50' : 'bg-accent-50'}`}>
            <div>
              <p className="text-gray-800">{wish.text}</p>
              <span className="text-xs text-gray-500">
                {wish.authorId === userData.userId ? 'あなた' : 'パートナー'}
              </span>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
               <Button onClick={() => handlePlanFromWish(wish)} variant="outline" className="text-xs py-1 px-2">計画する</Button>
               {wish.authorId === userData.userId && (
                  <button onClick={() => handleDeleteWish(wish.id)} className="p-1 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50">
                      <TrashIcon className="w-4 h-4"/>
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex space-x-2 pt-4 border-t">
        <input 
          type="text" 
          value={newWishText}
          onChange={(e) => setNewWishText(e.target.value)}
          placeholder="やってみたいことを追加..."
          className="flex-grow w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400"
          onKeyDown={(e) => e.key === 'Enter' && handleAddWish()}
        />
        <Button onClick={handleAddWish} className="!p-3 flex-shrink-0" aria-label="ウィッシュを追加">
          <ArrowUpCircleIcon className="h-6 w-6" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-center p-1 bg-gray-200/50 rounded-full border">
          <button 
            onClick={() => setActiveTab('plans')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'plans' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            予定一覧
          </button>
           <button 
            onClick={() => setActiveTab('wishes')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'wishes' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            ウィッシュリスト
          </button>
        </div>
      </div>

      {activeTab === 'plans' && renderPlansContent()}
      {activeTab === 'wishes' && renderWishesContent()}

      <Modal isOpen={isModalOpen} onClose={() => { setModalOpen(false); setModalInitialTitle(''); setCurrentPlan(null); }} title={currentPlan ? "予定を編集" : "新しい予定を計画"}>
        <PlanForm plan={currentPlan} onSave={handleSavePlan} onCancel={() => { setModalOpen(false); setModalInitialTitle(''); setCurrentPlan(null); }} initialTitle={modalInitialTitle} />
      </Modal>
    </div>
  );
};