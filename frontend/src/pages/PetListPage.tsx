import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPets, Pet } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function PetListPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = await getPets();
      setPets(data.items || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900">ペット一覧</h2>
        <Link to="/pets/new">
          <Button>新しいペットを登録</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-soft">
          <p className="text-neutral-600 mb-6 text-lg">
            まだペットが登録されていません
          </p>
          <Link to="/pets/new">
            <Button>最初のペットを登録する</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-xl shadow-soft hover:shadow-soft-md transition-all duration-150"
            >
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  {pet.name}
                </h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="inline text-neutral-600">種別: </dt>
                    <dd className="inline text-neutral-900 font-medium">
                      {pet.species === 'dog' && '犬'}
                      {pet.species === 'cat' && '猫'}
                      {pet.species === 'other' && 'その他'}
                    </dd>
                  </div>
                  {pet.breed && (
                    <div>
                      <dt className="inline text-neutral-600">品種: </dt>
                      <dd className="inline text-neutral-900 font-medium">{pet.breed}</dd>
                    </div>
                  )}
                  {pet.sex && (
                    <div>
                      <dt className="inline text-neutral-600">性別: </dt>
                      <dd className="inline text-neutral-900 font-medium">
                        {pet.sex === 'male' && 'オス'}
                        {pet.sex === 'female' && 'メス'}
                        {pet.sex === 'unknown' && '不明'}
                      </dd>
                    </div>
                  )}
                  {pet.birthday && (
                    <div>
                      <dt className="inline text-neutral-600">誕生日: </dt>
                      <dd className="inline text-neutral-900 font-medium">
                        {formatDate(pet.birthday)}
                      </dd>
                    </div>
                  )}
                </dl>
                {pet.notes && (
                  <p className="mt-4 text-sm text-neutral-600 line-clamp-2">
                    {pet.notes}
                  </p>
                )}
              </div>
              <div className="px-6 md:px-8 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
                <Link
                  to={`/pets/${pet.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
                >
                  カルテを見る
                </Link>
                <Link
                  to={`/pets/${pet.id}/edit`}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-150"
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
