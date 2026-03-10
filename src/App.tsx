// src/App.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import ItemCard from './ItemCard';

export interface Item {
  id: number;
  name: string;
  category: string;
  stock: number;
  total: number;
  myBorrowed: number;
}

const DUMMY_ITEMS: Item[] = [
  { id: 1, name: 'MacBook Pro', category: 'PC', stock: 3, total: 5, myBorrowed: 0 },
  { id: 2, name: 'Dell S2725Q モニター', category: '周辺機器', stock: 0, total: 2, myBorrowed: 0 },
  { id: 3, name: 'Geekom A6 ミニPC', category: 'PC', stock: 1, total: 1, myBorrowed: 0 },
  { id: 4, name: 'iPhone 15 テスト端末', category: 'スマートフォン', stock: 2, total: 2, myBorrowed: 0 },
  { id: 5, name: 'USB-C to HDMI ケーブル', category: 'ケーブル', stock: 5, total: 5, myBorrowed: 0 },
];

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  // 新規追加 1: フォームの入力値を管理するState
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('PC'); // 初期値は'PC'
  const [newTotal, setNewTotal] = useState(1);          // 初期値は1個

  useEffect(() => {
    const fetchItems = async () => {
      const itemsCollection = collection(db, 'items');
      const snapshot = await getDocs(itemsCollection);

      if (snapshot.empty) {
        for (const item of DUMMY_ITEMS) {
          const itemRef = doc(db, 'items', item.id.toString());
          await setDoc(itemRef, item);
        }
        setItems(DUMMY_ITEMS);
      } else {
        const fetchedData = snapshot.docs.map(doc => doc.data() as Item);
        fetchedData.sort((a, b) => a.id - b.id);
        setItems(fetchedData);
      }
    };

    fetchItems();
  }, []);

  // 新規追加 2: 新しい備品をFirebaseと画面に追加する処理
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault(); // フォーム送信時に画面がリロードされるのを防ぐ（Reactの基本テクニック）

    if (newName.trim() === '') return; // 名前が空っぽの場合は処理をストップ

    // 新しいIDを生成（現在ある最大のID + 1 にする）
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;

    // 新しい備品のデータを作成
    const newItem: Item = {
      id: newId,
      name: newName,
      category: newCategory,
      stock: newTotal,    // 追加したてなので、在庫数＝総数
      total: newTotal,
      myBorrowed: 0       // 誰も借りていないので0
    };

    // 画面（State）を先に更新する（...items で既存の配列を展開し、最後に newItem を追加）
    setItems([...items, newItem]);

    // 裏側でFirebaseに保存する
    const itemRef = doc(db, 'items', newId.toString());
    await setDoc(itemRef, newItem);

    // フォームの入力欄をリセットして空にする
    setNewName('');
    setNewCategory('PC');
    setNewTotal(1);
  };

  const handleBorrow = async (id: number) => {
    const updatedItems = items.map(item => 
      (item.id === id && item.stock > 0) 
        ? { ...item, stock: item.stock - 1, myBorrowed: item.myBorrowed + 1 }
        : item
    );
    setItems(updatedItems);

    const targetItem = updatedItems.find(item => item.id === id);
    if (targetItem) {
      const itemRef = doc(db, 'items', id.toString());
      await updateDoc(itemRef, { stock: targetItem.stock, myBorrowed: targetItem.myBorrowed });
    }
  };

  const handleReturn = async (id: number) => {
    const updatedItems = items.map(item => 
      (item.id === id && item.myBorrowed > 0) 
        ? { ...item, stock: item.stock + 1, myBorrowed: item.myBorrowed - 1 }
        : item
    );
    setItems(updatedItems);

    const targetItem = updatedItems.find(item => item.id === id);
    if (targetItem) {
      const itemRef = doc(db, 'items', id.toString());
      await updateDoc(itemRef, { stock: targetItem.stock, myBorrowed: targetItem.myBorrowed });
    }
  };

  const displayItems = items.filter((item) => {
    if (activeTab === 'my' && item.myBorrowed === 0) {
      return false; 
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(lowerCaseQuery) || 
           item.category.toLowerCase().includes(lowerCaseQuery);
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">社内備品管理システム</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            ログイン
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* 新規追加 3: 備品登録フォームのUI */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h3 className="text-md font-bold mb-4">＋ 新しい備品を登録</h3>
          <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 mb-1">備品名</label>
              <input
                type="text"
                required
                placeholder="例: Magic Mouse"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full md:w-48">
              <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PC">PC</option>
                <option value="スマートフォン">スマートフォン</option>
                <option value="周辺機器">周辺機器</option>
                <option value="ケーブル">ケーブル</option>
                <option value="書籍">書籍</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div className="w-full md:w-32">
              <label className="block text-xs text-gray-500 mb-1">総数</label>
              <input
                type="number"
                min="1"
                required
                value={newTotal}
                onChange={(e) => setNewTotal(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition-colors"
            >
              登録する
            </button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-1 font-bold transition-colors ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              すべての備品
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`pb-2 px-1 font-bold transition-colors ${activeTab === 'my' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              自分の借り物
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="備品名やカテゴリで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {displayItems.length === 0 && (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-100">
            表示する備品がありません。
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onBorrow={handleBorrow} 
              onReturn={handleReturn} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}