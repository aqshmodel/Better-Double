import React, { useState } from 'react';
import type { UserData, SharedMemo } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowUpCircleIcon } from './icons/ArrowUpCircleIcon';

interface DashboardProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  partnerData: UserData | null;
}

const moods: { key: 'happy' | 'okay' | 'sad'; emoji: string }[] = [
  { key: 'happy', emoji: '😄' },
  { key: 'okay', emoji: '🙂' },
  { key: 'sad', emoji: '😥' },
];

export const Dashboard: React.FC<DashboardProps> = ({ userData, setUserData, partnerData }) => {
  const [newMemoText, setNewMemoText] = useState('');

  const todaysGoals = userData.goals.filter(g => g.type === 'daily');
  const completedToday = todaysGoals.filter(g => g.completed).length;
  
  const partnerTodaysGoals = partnerData?.goals.filter(g => g.type === 'daily') || [];
  const partnerCompletedToday = partnerTodaysGoals.filter(g => g.completed).length;

  const recentAngerLog = [...userData.angerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const upcomingDatePlan = [...userData.datePlans, ...(partnerData?.datePlans || [])].filter(p => !p.completed).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const allMemos = [...(userData.sharedMemos || []), ...(partnerData?.sharedMemos || [])]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSetMood = (mood: 'happy' | 'okay' | 'sad') => {
    setUserData(prev => prev ? { ...prev, todayMood: mood } : null);
  };

  const handleAddMemo = () => {
    if (!newMemoText.trim()) return;
    const newMemo: SharedMemo = {
      id: `memo_${Date.now()}_${userData.userId}`,
      text: newMemoText.trim(),
      authorId: userData.userId,
      createdAt: new Date().toISOString(),
    };
    setUserData(prev => {
      if (!prev) return null;
      const updatedMemos = [...(prev.sharedMemos || []), newMemo];
      return { ...prev, sharedMemos: updatedMemos };
    });
    setNewMemoText('');
  };

  const handleDeleteMemo = (id: string) => {
    setUserData(prev => {
      if (!prev) return null;
      const updatedMemos = (prev.sharedMemos || []).filter(memo => memo.id !== id);
      return { ...prev, sharedMemos: updatedMemos };
    });
  };


  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-3">今日の気分は？</h2>
        <div className="flex justify-around items-center">
          {moods.map(mood => (
            <button
              key={mood.key}
              onClick={() => handleSetMood(mood.key)}
              className={`text-4xl p-2 rounded-full transition-transform duration-200 ${userData.todayMood === mood.key ? 'bg-primary-100 scale-110' : 'hover:bg-gray-100'}`}
              aria-label={mood.key}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </Card>
      
      {partnerData && (
        <Card className="bg-primary-50/50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">パートナーの今日の様子</h2>
          <div className="flex items-center space-x-6">
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-1">気分</span>
              <span className="text-5xl">{moods.find(m => m.key === partnerData.todayMood)?.emoji || '🙂'}</span>
            </div>
            <div className="flex-grow">
               <span className="text-sm text-gray-500 mb-2 block">目標</span>
               {partnerTodaysGoals.length > 0 ? (
                 <div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-accent-500 h-2.5 rounded-full" 
                        style={{ width: `${(partnerCompletedToday / partnerTodaysGoals.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-gray-600 mt-1 text-sm">{partnerCompletedToday} / {partnerTodaysGoals.length} 件 完了</p>
                  </div>
               ) : (
                  <p className="text-gray-500 text-sm">目標未設定</p>
               )}
            </div>
          </div>
        </Card>
      )}

      {partnerData && (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">共有メモ</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 flex flex-col">
            {allMemos.length === 0 && <p className="text-gray-500 text-sm text-center py-2">メモはまだありません。</p>}
            {allMemos.map(memo => (
              <div key={memo.id} className={`flex items-end gap-2 ${memo.authorId === userData.userId ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${memo.authorId === userData.userId ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <p className="text-gray-800 break-words">{memo.text}</p>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0 mb-1">
                    <span>{memo.authorId === userData.userId ? 'あなた' : 'パートナー'}</span>
                    <span className="mx-1">&middot;</span>
                    <span>{new Date(memo.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute:'2-digit' })}</span>
                    {memo.authorId === userData.userId && (
                      <button onClick={() => handleDeleteMemo(memo.id)} className="text-red-400 hover:text-red-600 ml-2 inline-block align-middle">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
           <div className="flex space-x-2 pt-4 border-t mt-4">
            <input 
              type="text" 
              value={newMemoText}
              onChange={(e) => setNewMemoText(e.target.value)}
              placeholder="ちょっとしたメモを共有..."
              className="flex-grow w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAddMemo()}
            />
            <Button onClick={handleAddMemo} className="!p-3 flex-shrink-0" aria-label="メモを追加">
              <ArrowUpCircleIcon className="h-6 w-6" />
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">あなたの今日の進捗</h3>
        {todaysGoals.length > 0 ? (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-primary-500 h-2.5 rounded-full" 
                style={{ width: `${(completedToday / todaysGoals.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-right text-gray-600">{completedToday} / {todaysGoals.length} 件 完了</p>
          </div>
        ) : (
          <p className="text-gray-500">今日の目標はまだ設定されていません。「目標」タブから追加しましょう。</p>
        )}
      </Card>
      
      {upcomingDatePlan && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">次の楽しみな予定</h3>
          <p className="text-accent-600 font-bold">{upcomingDatePlan.title}</p>
          <p className="text-gray-500">{new Date(upcomingDatePlan.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </Card>
      )}

      {recentAngerLog && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">最近の振り返り</h3>
          <p className="text-gray-600">
            {new Date(recentAngerLog.date).toLocaleDateString('ja-JP')}に気持ちを記録しました。
          </p>
          <p className="text-sm text-gray-500 mt-2">
            定期的に振り返ることで、感情のパターンに気づくことができます。
          </p>
        </Card>
      )}
    </div>
  );
};