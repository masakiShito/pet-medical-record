import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPets, getRecords, Pet, Record } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

interface RecordsByPet {
  [petId: number]: Record[];
}

export default function HomePage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecordsByPet>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const petsData = await getPets();
      setPets(petsData.items || []);

      // Load recent records for each pet
      const recordsData: RecordsByPet = {};
      for (const pet of petsData.items || []) {
        try {
          const records = await getRecords(pet.id, { limit: 3 } as any);
          recordsData[pet.id] = records.items || [];
        } catch (err) {
          console.error(`Error loading records for pet ${pet.id}:`, err);
          recordsData[pet.id] = [];
        }
      }
      setRecentRecords(recordsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">エラー: {error}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-neutral-900 mb-4">
          ペットを登録してください
        </h2>
        <p className="text-neutral-600 mb-8 text-lg">
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
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-neutral-900 mb-6">
          今日の記録
        </h2>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const todayRecord = (recentRecords[pet.id] || []).find(
              (r) => r.recorded_on === today
            );

            return (
              <div key={pet.id} className="bg-white rounded-xl shadow-soft p-6 md:p-8 transition-all duration-150 hover:shadow-soft-md">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {pet.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-5">
                  {pet.species === 'dog' && '犬'}
                  {pet.species === 'cat' && '猫'}
                  {pet.species === 'other' && 'その他'}
                  {pet.breed && ` - ${pet.breed}`}
                </p>

                {todayRecord ? (
                  <div className="mb-5">
                    <p className="text-sm text-success-600 font-medium mb-2">
                      ✓ 今日の記録済み
                    </p>
                    <Link
                      to={`/pets/${pet.id}/records/${todayRecord.id}`}
                      className="text-sm text-success-600 hover:text-success-700 transition-colors duration-150"
                    >
                      記録を見る
                    </Link>
                  </div>
                ) : (
                  <div className="mb-5">
                    <p className="text-sm text-neutral-500 mb-3">
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
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-150"
                >
                  カルテを見る →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-neutral-900 mb-6">
          最近の記録
        </h2>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => {
            const records = recentRecords[pet.id] || [];

            return (
              <div key={pet.id} className="bg-white rounded-xl shadow-soft p-6 md:p-8 transition-all duration-150 hover:shadow-soft-md">
                <h3 className="text-xl font-semibold text-neutral-900 mb-5">
                  {pet.name}
                </h3>

                {records.length === 0 ? (
                  <p className="text-sm text-neutral-500">記録がありません</p>
                ) : (
                  <ul className="space-y-3">
                    {records.slice(0, 3).map((record) => (
                      <li key={record.id}>
                        <Link
                          to={`/pets/${pet.id}/records/${record.id}`}
                          className="block text-sm hover:bg-neutral-50 p-3 rounded-lg transition-colors duration-150"
                        >
                          <div className="font-medium text-neutral-900">
                            {formatDate(record.recorded_on)}
                          </div>
                          {record.title && (
                            <div className="text-neutral-600 mt-1">{record.title}</div>
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
