// src/ItemCard.tsx
import type { Item } from './App';

interface ItemCardProps {
  item: Item;
  onBorrow: (id: number) => void;
  onReturn: (id: number) => void;
}

export default function ItemCard({ item, onBorrow, onReturn }: ItemCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
      <div className="w-full h-32 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">
        No Image
      </div>
      <div className="flex-1">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          {item.category}
        </span>
        <h3 className="font-bold text-lg mt-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          在庫: <span className={`font-bold ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {item.stock}
          </span> / {item.total}
          
          {/* 新規追加：自分が借りている場合のみ、青文字で借用数を表示します */}
          {item.myBorrowed > 0 && (
            <span className="ml-2 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded">
              {item.myBorrowed}個 借用中
            </span>
          )}
        </p>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          disabled={item.stock === 0}
          onClick={() => onBorrow(item.id)}
          className={`flex-1 py-2 rounded-md font-semibold transition-colors
            ${item.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' : 'bg-gray-300 text-white cursor-not-allowed'}`}
        >
          借りる
        </button>
        {/* 変更：返すボタンが押せる条件を「自分が1個以上借りているか」に変更しました */}
        <button
          disabled={item.myBorrowed === 0}
          onClick={() => onReturn(item.id)}
          className={`flex-1 py-2 rounded-md font-semibold transition-colors border
            ${item.myBorrowed > 0 ? 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50 active:bg-blue-100' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
        >
          返す
        </button>
      </div>
    </div>
  );
}