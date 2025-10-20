
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { AngerLog } from './components/AngerLog';
import { Planner } from './components/Planner';
import { Settings } from './components/Settings';
import Auth from './components/Auth';
import * as db from './services/firebase';
import type { UserData } from './types';
import type { User } from 'firebase/auth';

export type View = 'dashboard' | 'goals' | 'anger' | 'planner' | 'settings';

const viewTitles: Record<View, string> = {
  dashboard: 'ホーム',
  goals: '目標と習慣',
  anger: '気持ちの記録',
  planner: 'ふたりの時間',
  settings: '設定'
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [partnerData, setPartnerData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = db.onAuth(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const data = await db.loadUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUser(null);
        setUserData(null);
        setPartnerData(null);
      }
      setIsLoading(false);
    });
    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // ユーザーデータが更新されたときにFirestoreに保存
    if (userData) {
      db.saveUserData(userData.userId, userData);

      // パートナーコードが存在すれば、パートナーのデータを読み込む
      if (userData.partnerCode && (!partnerData || partnerData.userId !== userData.partnerCode)) {
        const fetchPartnerData = async () => {
          const pData = await db.loadPartnerData(userData.partnerCode!);
          setPartnerData(pData);
        };
        fetchPartnerData();
      } else if (!userData.partnerCode) {
        setPartnerData(null);
      }
    }
  }, [userData]);

  if (isLoading) {
    return <div className="text-center p-10">読み込み中...</div>;
  }
  
  if (!user || !userData) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userData={userData} setUserData={setUserData} partnerData={partnerData} />;
      case 'goals':
        return <Goals userData={userData} setUserData={setUserData} />;
      case 'anger':
        return <AngerLog userData={userData} setUserData={setUserData} partnerData={partnerData} />;
      case 'planner':
        return <Planner userData={userData} setUserData={setUserData} partnerData={partnerData} />;
      case 'settings':
        return <Settings userData={userData} setUserData={setUserData} />;
      default:
        return <Dashboard userData={userData} setUserData={setUserData} partnerData={partnerData} />;
    }
  };

  return (
    <div className="font-sans text-gray-900">
      <Header appTitle="Better Double" viewTitle={viewTitles[currentView]} />
      <main className="max-w-4xl mx-auto p-4 pb-24">
        {renderContent()}
      </main>
      <BottomNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;