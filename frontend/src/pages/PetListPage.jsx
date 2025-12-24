import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPets } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function PetListPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await getPets();
      setPets(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ペット一覧</h2>
        <Link to="/pets/new">
          <Button>新しいペットを登録</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            まだペットが登録されていません
          </p>
          <Link to="/pets/new">
            <Button>最初のペットを登録する</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {pet.name}
                </h3>
                <dl className="space-y-1 text-sm">
                  <div>
                    <dt className="inline text-gray-600">種別: </dt>
                    <dd className="inline text-gray-900">
                      {pet.species === 'dog' && '犬'}
                      {pet.species === 'cat' && '猫'}
                      {pet.species === 'other' && 'その他'}
                    </dd>
                  </div>
                  {pet.breed && (
                    <div>
                      <dt className="inline text-gray-600">品種: </dt>
                      <dd className="inline text-gray-900">{pet.breed}</dd>
                    </div>
                  )}
                  {pet.sex && (
                    <div>
                      <dt className="inline text-gray-600">性別: </dt>
                      <dd className="inline text-gray-900">
                        {pet.sex === 'male' && 'オス'}
                        {pet.sex === 'female' && 'メス'}
                        {pet.sex === 'unknown' && '不明'}
                      </dd>
                    </div>
                  )}
                  {pet.birthday && (
                    <div>
                      <dt className="inline text-gray-600">誕生日: </dt>
                      <dd className="inline text-gray-900">
                        {formatDate(pet.birthday)}
                      </dd>
                    </div>
                  )}
                </dl>
                {pet.notes && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {pet.notes}
                  </p>
                )}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                <Link
                  to={`/pets/${pet.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  カルテを見る
                </Link>
                <Link
                  to={`/pets/${pet.id}/edit`}
                  className="text-sm text-gray-600 hover:underline"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
