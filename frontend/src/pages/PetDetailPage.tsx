import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPet, getRecords, Pet, Record } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [petId]);

  const loadData = async () => {
    if (!petId) return;

    try {
      setLoading(true);
      const [petData, recordsData] = await Promise.all([
        getPet(Number(petId)),
        getRecords(Number(petId), { limit: 100 } as any),
      ]);

      setPet(petData);
      setRecords(recordsData.items || []);
    } catch (err) {
      setError((err as Error).message);
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

  if (error || !pet) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">エラー: {error || 'ペットが見つかりません'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← 戻る
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {pet.name}
              </h2>
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
                <p className="mt-3 text-sm text-gray-700">{pet.notes}</p>
              )}
            </div>
            <Link to={`/pets/${petId}/edit`}>
              <Button variant="secondary">編集</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              カルテ (記録一覧)
            </h3>
            <Link to={`/pets/${petId}/records/new`}>
              <Button>記録を追加</Button>
            </Link>
          </div>
        </div>

        <div className="p-6">
          {records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">まだ記録がありません</p>
              <Link to={`/pets/${petId}/records/new`}>
                <Button>最初の記録を追加する</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Link
                  key={record.id}
                  to={`/pets/${petId}/records/${record.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(record.recorded_on)}
                      </p>
                      {record.title && (
                        <p className="text-gray-700">{record.title}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 text-xs">
                      {record.has_weights && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          体重
                        </span>
                      )}
                      {record.has_medications && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          投薬
                        </span>
                      )}
                      {record.has_vet_visits && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          通院
                        </span>
                      )}
                    </div>
                  </div>
                  {(record.condition_level ||
                    record.appetite_level ||
                    record.stool_level) && (
                    <div className="flex space-x-4 text-sm text-gray-600">
                      {record.condition_level && (
                        <span>体調: {record.condition_level}/5</span>
                      )}
                      {record.appetite_level && (
                        <span>食欲: {record.appetite_level}/5</span>
                      )}
                      {record.stool_level && (
                        <span>便: {record.stool_level}/5</span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
