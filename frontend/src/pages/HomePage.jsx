import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPets, getRecords } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function HomePage() {
  const [pets, setPets] = useState([]);
  const [recentRecords, setRecentRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const petsData = await getPets();
      setPets(petsData.items || []);

      // Load recent records for each pet
      const recordsData = {};
      for (const pet of petsData.items || []) {
        try {
          const records = await getRecords(pet.id, { limit: 3 });
          recordsData[pet.id] = records.items || [];
        } catch (err) {
          console.error(`Error loading records for pet ${pet.id}:`, err);
          recordsData[pet.id] = [];
        }
      }
      setRecentRecords(recordsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">エラー: {error}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ペットを登録してください
        </h2>
        <p className="text-gray-600 mb-6">
          まだペットが登録されていません。最初のペットを登録して記録を始めましょう。
        </p>
        <Link to="/pets/new">
          <Button>ペットを登録する</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          今日の記録
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const todayRecord = (recentRecords[pet.id] || []).find(
              (r) => r.recorded_on === today
            );

            return (
              <div key={pet.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pet.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {pet.species === 'dog' && '犬'}
                  {pet.species === 'cat' && '猫'}
                  {pet.species === 'other' && 'その他'}
                  {pet.breed && ` - ${pet.breed}`}
                </p>

                {todayRecord ? (
                  <div className="mb-4">
                    <p className="text-sm text-green-600 font-medium mb-2">
                      ✓ 今日の記録済み
                    </p>
                    <Link
                      to={`/pets/${pet.id}/records/${todayRecord.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      記録を見る
                    </Link>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      今日の記録はまだありません
                    </p>
                    <Link to={`/pets/${pet.id}/records/new`}>
                      <Button variant="primary" className="w-full">
                        記録を追加
                      </Button>
                    </Link>
                  </div>
                )}

                <Link
                  to={`/pets/${pet.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  カルテを見る →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          最近の記録
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const records = recentRecords[pet.id] || [];

            return (
              <div key={pet.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {pet.name}
                </h3>

                {records.length === 0 ? (
                  <p className="text-sm text-gray-500">記録がありません</p>
                ) : (
                  <ul className="space-y-2">
                    {records.slice(0, 3).map((record) => (
                      <li key={record.id}>
                        <Link
                          to={`/pets/${pet.id}/records/${record.id}`}
                          className="block text-sm hover:bg-gray-50 p-2 rounded"
                        >
                          <div className="font-medium text-gray-900">
                            {formatDate(record.recorded_on)}
                          </div>
                          {record.title && (
                            <div className="text-gray-600">{record.title}</div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
