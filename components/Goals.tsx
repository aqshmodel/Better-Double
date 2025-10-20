import React, { useState } from 'react';
import type { UserData, Goal, Habit, WeeklyReflection } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';

interface GoalsProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const Goals: React.FC<GoalsProps> = ({ userData, setUserData }) => {
  const [activeTab, setActiveTab] = useState<'goals' | 'habits' | 'reflection'>('goals');
  const [isGoalModalOpen, setGoalModalOpen] = useState(false);
  const [isHabitModalOpen, setHabitModalOpen] = useState(false);
  const [isReflectionModalOpen, setReflectionModalOpen] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  const [currentReflection, setCurrentReflection] = useState<WeeklyReflection | null>(null);

  const handleToggleGoal = (id: string) => {
    setUserData(prev => prev ? {
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    } : null);
  };

  const handleDeleteGoal = (id: string) => {
    setUserData(prev => prev ? { ...prev, goals: prev.goals.filter(g => g.id !== id) } : null);
  };
  
  const handleDeleteHabit = (id: string) => {
    setUserData(prev => prev ? { ...prev, habits: prev.habits.filter(h => h.id !== id) } : null);
  };
  
  const handleHabitSuccess = (id: string) => {
     setUserData(prev => prev ? {
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, successCount: h.successCount + 1 } : h)
    } : null);
  }
  
  const handleDeleteReflection = (id: string) => {
    setUserData(prev => prev ? { ...prev, weeklyReflections: (prev.weeklyReflections || []).filter(j => j.id !== id) } : null);
  };

  const handleEditGoal = (goal: Goal) => { setCurrentGoal(goal); setGoalModalOpen(true); }
  const handleEditHabit = (habit: Habit) => { setCurrentHabit(habit); setHabitModalOpen(true); }
  const handleEditReflection = (reflection: WeeklyReflection) => { setCurrentReflection(reflection); setReflectionModalOpen(true); }

  const inputStyle = "mt-1 block w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 transition-colors focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder-gray-400";
  const textareaStyle = `${inputStyle} resize-vertical`;

  const GoalForm = ({ goal, onSave, onCancel }: { goal: Goal | null, onSave: (goal: Goal) => void, onCancel: () => void }) => {
    const [text, setText] = useState(goal?.text || '');
    const [type, setType] = useState<'daily' | 'weekly'>(goal?.type || 'daily');
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      onSave({
        id: goal?.id || `goal_${Date.now()}`,
        text,
        type,
        completed: goal?.completed || false
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">目標</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} className={inputStyle} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">タイプ</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'daily' | 'weekly')} className={inputStyle}>
            <option value="daily">毎日</option>
            <option value="weekly">毎週</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    );
  };

  const HabitForm = ({ habit, onSave, onCancel }: { habit: Habit | null, onSave: (habit: Habit) => void, onCancel: () => void }) => {
    const [habitToChange, setHabitToChange] = useState(habit?.habitToChange || '');
    const [trigger, setTrigger] = useState(habit?.trigger || '');
    const [idealAction, setIdealAction] = useState(habit?.idealAction || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!habitToChange.trim() || !idealAction.trim()) return;
      onSave({
        id: habit?.id || `habit_${Date.now()}`,
        habitToChange,
        trigger,
        idealAction,
        successCount: habit?.successCount || 0
      });
    };
    
    return (
       <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">やめたい習慣</label>
          <input type="text" value={habitToChange} onChange={(e) => setHabitToChange(e.target.value)} className={inputStyle} required />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700">きっかけ (任意)</label>
          <input type="text" value={trigger} onChange={(e) => setTrigger(e.target.value)} className={inputStyle} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">理想の行動</label>
          <input type="text" value={idealAction} onChange={(e) => setIdealAction(e.target.value)} className={inputStyle} required />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">保存</Button>
        </div>
      </form>
    )
  }
  
  const ReflectionForm = ({ reflection, onSave, onCancel }: { reflection: WeeklyReflection | null, onSave: (reflection: WeeklyReflection) => void, onCancel: () => void }) => {
    const [gratitude, setGratitude] = useState(reflection?.gratitude || '');
    const [challenge, setChallenge] = useState(reflection?.challenge || '');
    const [learning, setLearning] = useState(reflection?.learning || '');
    const [praise, setPraise] = useState(reflection?.praise || '');
    const [nextAction, setNextAction] = useState(reflection?.nextAction || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        id: reflection?.id || `reflection_${Date.now()}`,
        date: reflection?.date || new Date().toISOString(),
        gratitude,
        challenge,
        learning,
        praise,
        nextAction,
      });
    };

    const questions = [
      { label: "今週、最も感謝したことは何ですか？", value: gratitude, setter: setGratitude },
      { label: "今週、最も挑戦だったことは何ですか？", value: challenge, setter: setChallenge },
      { label: "その挑戦から何を学びましたか？", value: learning, setter: setLearning },
      { label: "今週、自分を褒めてあげたいことは何ですか？", value: praise, setter: setPraise },
      { label: "来週、特に意識したいことは何ですか？", value: nextAction, setter: setNextAction },
    ];

    return (
       <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map(q => (
          <div key={q.label}>
            <label className="block text-sm font-medium text-gray-700">{q.label}</label>
            <textarea value={q.value} onChange={(e) => q.setter(e.target.value)} className={textareaStyle} rows={3} />
          </div>
        ))}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
          <Button type="submit">記録する</Button>
        </div>
      </form>
    );
  };
  
  const sortedReflections = [...(userData.weeklyReflections || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  // --- Render Functions for Tabs ---
  
  const renderGoalsContent = () => (
     <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">行動目標</h2>
          <Button onClick={() => { setCurrentGoal(null); setGoalModalOpen(true); }} className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            <span>追加</span>
          </Button>
        </div>
        <div className="space-y-2">
          {userData.goals.length === 0 && <p className="text-gray-500 text-center py-4">目標を追加しましょう。</p>}
          {userData.goals.map(goal => (
            <div key={goal.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
              <label className="flex items-center cursor-pointer flex-grow">
                <input type="checkbox" checked={goal.completed} onChange={() => handleToggleGoal(goal.id)} className="h-5 w-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <span className={`ml-3 ${goal.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{goal.text}</span>
              </label>
              <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                 <button onClick={() => handleEditGoal(goal)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
  );
  
  const renderHabitsContent = () => (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">習慣の改善</h2>
          <Button onClick={() => { setCurrentHabit(null); setHabitModalOpen(true); }} className="flex items-center gap-2">
             <PlusIcon className="h-5 w-5" />
            <span>追加</span>
          </Button>
        </div>
        <div className="space-y-4">
          {userData.habits.length === 0 && <p className="text-gray-500 text-center py-4">改善したい習慣を追加しましょう。</p>}
          {userData.habits.map(habit => (
            <div key={habit.id} className="p-4 bg-primary-50/60 rounded-lg">
                <p className="font-semibold text-gray-700">やめたい習慣: <span className="font-normal">{habit.habitToChange}</span></p>
                {habit.trigger && <p className="text-sm text-gray-600">きっかけ: <span className="font-normal">{habit.trigger}</span></p>}
                <p className="font-semibold text-primary-700">理想の行動: <span className="font-normal">{habit.idealAction}</span></p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                     <Button onClick={() => handleHabitSuccess(habit.id)} className="py-1 px-3 text-sm">成功！</Button>
                     <span className="text-sm text-gray-600 ml-3">成功回数: {habit.successCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleEditHabit(habit)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-white/50">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteHabit(habit.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-white/50">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </Card>
  );

  const renderReflectionContent = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-3 mb-4">
            <ArchiveBoxIcon className="h-7 w-7 text-primary-500"/>
            <h2 className="text-xl font-bold text-gray-800">週の振り返り</h2>
        </div>
        <p className="text-gray-600">一週間の終わりに、自分と向き合う時間を作りましょう。これはパートナーには共有されない、あなただけの内省の記録です。</p>
        <div className="text-center mt-4">
          <Button onClick={() => { setCurrentReflection(null); setReflectionModalOpen(true); }}>今週の振り返りを書く</Button>
        </div>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 px-1">過去の振り返り</h3>
        {sortedReflections.length === 0 && <Card><p className="text-gray-500 text-center py-4">まだ振り返りの記録がありません。</p></Card>}
        {sortedReflections.map(reflection => (
          <Card key={reflection.id} className="relative group">
             <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditReflection(reflection)} className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => handleDeleteReflection(reflection.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            <p className="text-sm font-semibold text-gray-600 mb-3">{new Date(reflection.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}の週</p>
            <div className="space-y-3 text-gray-800">
                {reflection.gratitude && <div><p className="font-semibold text-primary-700 text-sm">感謝したこと</p><p>{reflection.gratitude}</p></div>}
                {reflection.challenge && <div><p className="font-semibold text-primary-700 text-sm">挑戦だったこと</p><p>{reflection.challenge}</p></div>}
                {reflection.learning && <div><p className="font-semibold text-primary-700 text-sm">学んだこと</p><p>{reflection.learning}</p></div>}
                {reflection.praise && <div><p className="font-semibold text-primary-700 text-sm">自分を褒めたいこと</p><p>{reflection.praise}</p></div>}
                {reflection.nextAction && <div><p className="font-semibold text-accent-700 text-sm">来週意識したいこと</p><p>{reflection.nextAction}</p></div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );


  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-center p-1 bg-gray-200/50 rounded-full border">
          <button 
            onClick={() => setActiveTab('goals')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'goals' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            目標
          </button>
           <button 
            onClick={() => setActiveTab('habits')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'habits' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            習慣
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`w-full py-2 px-4 rounded-full text-sm font-semibold transition-colors ${activeTab === 'reflection' ? 'bg-white shadow text-primary-600' : 'text-gray-600 hover:bg-white/60'}`}
          >
            振り返り
          </button>
        </div>
      </div>

      {activeTab === 'goals' && renderGoalsContent()}
      {activeTab === 'habits' && renderHabitsContent()}
      {activeTab === 'reflection' && renderReflectionContent()}
      
      <Modal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} title={currentGoal ? '目標を編集' : '新しい目標'}>
        <GoalForm 
          goal={currentGoal}
          onCancel={() => setGoalModalOpen(false)}
          onSave={(goal) => {
            setUserData(prev => {
              if (!prev) return null;
              const exists = prev.goals.some(g => g.id === goal.id);
              return {
                ...prev,
                goals: exists ? prev.goals.map(g => g.id === goal.id ? goal : g) : [...prev.goals, goal]
              };
            });
            setGoalModalOpen(false);
          }}
        />
      </Modal>

       <Modal isOpen={isHabitModalOpen} onClose={() => setHabitModalOpen(false)} title={currentHabit ? '習慣を編集' : '新しい習慣'}>
        <HabitForm
          habit={currentHabit}
          onCancel={() => setHabitModalOpen(false)}
          onSave={(habit) => {
            setUserData(prev => {
              if (!prev) return null;
              const exists = prev.habits.some(h => h.id === habit.id);
              return {
                ...prev,
                habits: exists ? prev.habits.map(h => h.id === habit.id ? habit : h) : [...prev.habits, habit]
              };
            });
            setHabitModalOpen(false);
          }}
        />
      </Modal>

      <Modal isOpen={isReflectionModalOpen} onClose={() => setReflectionModalOpen(false)} title={currentReflection ? "振り返りを編集" : "週の振り返り"}>
        <ReflectionForm
          reflection={currentReflection}
          onCancel={() => setReflectionModalOpen(false)}
          onSave={(reflection) => {
            setUserData(prev => {
              if (!prev) return null;
              const reflections = prev.weeklyReflections || [];
              const exists = reflections.some(j => j.id === reflection.id);
              return {
                ...prev,
                weeklyReflections: exists ? reflections.map(j => j.id === reflection.id ? reflection : j) : [...reflections, reflection]
              };
            });
            setReflectionModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};