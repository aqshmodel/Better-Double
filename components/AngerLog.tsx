import React, { useState } from 'react';
import type { UserData, AngerLog as AngerLogType, AppreciationLog, InstructionManualItem } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

interface AngerLogProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  partnerData: UserData | null;
}

const manualCategories: { key: InstructionManualItem['category']; label: string, color: string }[] = [
  { key: 'pleasure', label: '嬉しいことリスト', color: 'bg-green-100 text-green-800' },
  { key: 'sadness', label: '悲しいことリスト', color: 'bg-blue-100 text-blue-800' },
  { key: 'anger', label: '怒りのトリガー', color: 'bg-red-100 text-red-800' },
  { key: 'help', label: 'こうしてくれると助かること', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'other', label: 'その他', color: 'bg-gray-100 text-gray-800' },
];

export const AngerLog: React.FC<AngerLogProps> = ({ userData, setUserData, partnerData }) => {
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<AngerLogType | null>(null);
  const [activeTab, setActiveTab] = useState<'anger' | 'appreciation' | 'manual'>('anger');
  const [newAppreciationText, setNewAppreciationText] = useState('');
  const [isManualModalOpen, setManualModalOpen] = useState(false);
  const [currentManualItem, setCurrentManualItem] = useState<InstructionManualItem | null>(null);

  const inputStyle = "mt-1 block w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400";
  const textareaStyle = `${inputStyle} resize-vertical`;

  // --- Anger Log ---
  const handleEditLog = (log: AngerLogType) => {
    setCurrentLog(log);
    setLogModalOpen(true);
  };
  const handleDeleteLog = (id: string) => {
    setUserData(prev => prev ? { ...prev, angerLogs: prev.angerLogs.filter(log => log.id !== id)} : null)
  }

  // --- Appreciation Log ---
  const handleAddAppreciation = () => {
    if (!newAppreciationText.trim()) return;
    const newLog: AppreciationLog = {
      id: `appreciation_${Date.now()}_${userData.userId}`,
      text: newAppreciationText.trim(),
      authorId: userData.userId,
      createdAt: new Date().toISOString(),
    };
    setUserData(prev => {
      if (!prev) return null;
      const updatedLogs = [...(prev.appreciationLogs || []), newLog];
      return { ...prev, appreciationLogs: updatedLogs };
    });
    setNewAppreciationText('');
  };
  const handleDeleteAppreciation = (id: string) => {
    setUserData(prev => {
      if (!prev) return null;
      const updatedLogs = (prev.appreciationLogs || []).filter(log => log.id !== id);
      return { ...prev, appreciationLogs: updatedLogs };
    });
  };
  
  // --- Manual ---
  const handleEditManualItem = (item: InstructionManualItem) => {
    setCurrentManualItem(item);
    setManualModalOpen(true);
  };
  const handleDeleteManualItem = (id: string) => {
     setUserData(prev => {
      if (!prev) return null;
      const manual = prev.instructionManual || [];
      return { ...prev, instructionManual: manual.filter(item => item.id !== id) };
    });
  }

  // Forms
  const AngerLogForm = ({ log, onSave, onCancel }: { log: AngerLogType | null, onSave: (log: AngerLogType) => void, onCancel: () => void }) => {
    const [situation, setSituation] = useState(log?.situation || '');
    const [feelingScale, setFeelingScale] = useState(log?.feelingScale || 5);
    const [trigger, setTrigger] = useState(log?.trigger || '');
    const [betterResponse, setBetterResponse] = useState(log?.betterResponse || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        id: log?.id || `log_${Date.now()}`,
        date: log?.date || new Date().toISOString(),
        situation,
        feelingScale,
        trigger,
        betterResponse
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">何がありましたか？</label>
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} className={textareaStyle} rows={3} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">イライラ度 (1-10)</label>
          <input type="range" min="1" max="10" value={feelingScale} onChange={(e) => setFeelingScale(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500" />
          <div className="text-center font-bold text-primary-600">{feelingScale}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">引き金になったことは何ですか？</label>
          <input type="text" value={trigger} onChange={(e) => setTrigger(e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">次はどうすれば良いと思いますか？</label>
          <textarea value={betterResponse} onChange={(e) => setBetterResponse(e.target.value)} className={textareaStyle} rows={3} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">記録する</Button>
        </div>
      </form>
    );
  };
  
  const ManualForm = ({ item, onSave, onCancel }: { item: InstructionManualItem | null, onSave: (item: InstructionManualItem) => void, onCancel: () => void }) => {
    const [category, setCategory] = useState<InstructionManualItem['category']>(item?.category || 'pleasure');
    const [content, setContent] = useState(item?.content || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;
      onSave({
        id: item?.id || `manual_${Date.now()}`,
        category,
        content
      });
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
          <select value={category} onChange={e => setCategory(e.target.value as InstructionManualItem['category'])} className={inputStyle}>
            {manualCategories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">内容</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className={textareaStyle} rows={4} required/>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    )
  }
  
  // Data processing
  const sortedAngerLogs = [...userData.angerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const allAppreciationLogs = [...(userData.appreciationLogs || []), ...(partnerData?.appreciationLogs || [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const myManual = userData.instructionManual || [];
  const partnerManual = partnerData?.instructionManual || [];


  // Render functions for tabs
  const renderAngerContent = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">クールダウン</h2>
          <Button onClick={() => { setCurrentLog(null); setLogModalOpen(true); }}>記録する</Button>
        </div>
        <p className="text-gray-600">苛立ちを感じたときは、一度立ち止まって記録してみましょう。客観的に状況を振り返ることで、冷静さを取り戻す手助けになります。</p>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 px-1">過去の記録</h3>
        {sortedAngerLogs.length === 0 && <Card><p className="text-gray-500 text-center py-4">まだ記録がありません。</p></Card>}
        {sortedAngerLogs.map(log => (
          <Card key={log.id} className="relative">
             <div className="absolute top-3 right-3 flex items-center space-x-1">
                <button onClick={() => handleEditLog(log)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            <p className="text-sm text-gray-500 mb-2">{new Date(log.date).toLocaleString('ja-JP')}</p>
            <p className="font-semibold">状況: <span className="font-normal">{log.situation}</span></p>
            <p className="font-semibold">イライラ度: <span className="font-normal">{log.feelingScale}</span></p>
            {log.trigger && <p className="font-semibold">きっかけ: <span className="font-normal">{log.trigger}</span></p>}
            {log.betterResponse && <p className="font-semibold text-primary-700">次の対策: <span className="font-normal">{log.betterResponse}</span></p>}
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAppreciationContent = () => (
    <div className="space-y-6">
       <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">感謝ログ</h2>
          <div className="space-y-2">
            <textarea 
              value={newAppreciationText}
              onChange={(e) => setNewAppreciationText(e.target.value)}
              placeholder="パートナーへの感謝を伝えよう"
              className={textareaStyle}
              rows={3}
            />
            <div className="text-right">
              <Button onClick={handleAddAppreciation}>投稿する</Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 px-1">ふたりの感謝タイムライン</h3>
            {allAppreciationLogs.length === 0 && <Card><p className="text-gray-500 text-sm text-center py-4">まだ感謝ログはありません。</p></Card>}
            {allAppreciationLogs.map(log => (
             <div key={log.id} className={`flex items-start gap-3 ${log.authorId === userData.userId ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${log.authorId === userData.userId ? 'bg-primary-50' : 'bg-gray-100'}`}>
                  <p className="text-gray-800 break-words">{log.text}</p>
                   <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                      <span>{log.authorId === userData.userId ? 'あなた' : 'パートナー'}</span>
                      <span className="opacity-50">&middot;</span>
                      <span>{new Date(log.createdAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                   </div>
                </div>
                 {log.authorId === userData.userId && (
                    <button onClick={() => handleDeleteAppreciation(log.id)} className="text-red-400 hover:text-red-600 mt-1 flex-shrink-0">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
              </div>
            ))}
        </div>
    </div>
  );
  
  const renderManualContent = () => (
     <div className="space-y-6">
        <Card>
            <div className="flex items-center gap-3 mb-4">
               <BookOpenIcon className="h-7 w-7 text-primary-500"/>
               <h2 className="text-xl font-bold text-gray-800">わたしのトリセツ</h2>
            </div>
            <p className="text-gray-600">自分の特性や感じ方をパートナーに共有することで、お互いの理解を深め、すれ違いを減らしましょう。</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* My Manual */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-lg font-semibold text-gray-700">あなたのトリセツ</h3>
                    <Button onClick={() => {setCurrentManualItem(null); setManualModalOpen(true);}} className="flex items-center gap-1 py-1 px-3 text-sm">
                        <PlusIcon className="h-4 w-4"/>
                        <span>追加</span>
                    </Button>
                </div>
                {myManual.length === 0 && <Card><p className="text-center text-gray-500 py-4">あなたのトリセツを作成しましょう。</p></Card>}
                {manualCategories.map(cat => {
                    const items = myManual.filter(item => item.category === cat.key);
                    if (items.length === 0) return null;
                    return (
                        <Card key={cat.key}>
                            <h4 className={`text-sm font-bold inline-block px-2 py-1 rounded-md mb-3 ${cat.color}`}>{cat.label}</h4>
                            <ul className="space-y-2">
                                {items.map(item => (
                                    <li key={item.id} className="group flex justify-between items-start gap-2 p-2 rounded-md hover:bg-gray-50">
                                        <p className="text-gray-800 flex-grow">{item.content}</p>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button onClick={() => handleEditManualItem(item)} className="p-1 text-gray-400 hover:text-primary-600"><PencilIcon className="h-4 w-4"/></button>
                                            <button onClick={() => handleDeleteManualItem(item.id)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-4 w-4"/></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )
                })}
            </div>

             {/* Partner's Manual */}
            <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-700 px-1">パートナーのトリセツ</h3>
                 {!partnerData && <Card><p className="text-center text-gray-500 py-4">パートナーと連携すると、ここにトリセツが表示されます。</p></Card>}
                 {partnerData && partnerManual.length === 0 && <Card><p className="text-center text-gray-500 py-4">パートナーはまだトリセツを作成していません。</p></Card>}
                 {partnerData && partnerManual.length > 0 && manualCategories.map(cat => {
                    const items = partnerManual.filter(item => item.category === cat.key);
                    if (items.length === 0) return null;
                    return (
                        <Card key={cat.key}>
                            <h4 className={`text-sm font-bold inline-block px-2 py-1 rounded-md mb-3 ${cat.color}`}>{cat.label}</h4>
                            <ul className="space-y-2">
                                {items.map(item => (
                                    <li key={item.id} className="p-2">
                                        <p className="text-gray-800">{item.content}</p>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )
                })}
            </div>
        </div>
     </div>
  );


  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-center p-1 bg-gray-200/50 rounded-full border">
          <button 
            onClick={() => setActiveTab('anger')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'anger' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            クールダウン
          </button>
           <button 
            onClick={() => setActiveTab('manual')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'manual' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            わたしのトリセツ
          </button>
          <button
            onClick={() => setActiveTab('appreciation')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'appreciation' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            感謝ログ
          </button>
        </div>
      </div>
      
      {activeTab === 'anger' && renderAngerContent()}
      {activeTab === 'appreciation' && renderAppreciationContent()}
      {activeTab === 'manual' && renderManualContent()}

      {/* --- Modals --- */}
      <Modal isOpen={isLogModalOpen} onClose={() => setLogModalOpen(false)} title={currentLog ? "記録を編集" : "気持ちを記録する"}>
        <AngerLogForm
          log={currentLog} 
          onCancel={() => setLogModalOpen(false)}
          onSave={(log) => {
             setUserData(prev => {
              if (!prev) return null;
              const exists = prev.angerLogs.some(l => l.id === log.id);
              return {
                ...prev,
                angerLogs: exists ? prev.angerLogs.map(l => l.id === log.id ? log : l) : [...prev.angerLogs, log]
              };
            });
            setLogModalOpen(false);
          }}
        />
      </Modal>
      <Modal isOpen={isManualModalOpen} onClose={() => setManualModalOpen(false)} title={currentManualItem ? "トリセツを編集" : "トリセツ項目を追加"}>
        <ManualForm
            item={currentManualItem}
            onCancel={() => setManualModalOpen(false)}
            onSave={(item) => {
              setUserData(prev => {
                if (!prev) return null;
                const manual = prev.instructionManual || [];
                const exists = manual.some(i => i.id === item.id);
                return {
                  ...prev,
                  instructionManual: exists ? manual.map(i => i.id === item.id ? item : i) : [...manual, item]
                };
              });
              setManualModalOpen(false);
            }}
        />
      </Modal>
    </div>
  );
};