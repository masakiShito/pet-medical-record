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
      <div className="text-center py-12">
        <p className="text-neutral-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">エラー: {error || 'ペットが見つかりません'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 transition-colors duration-150 mb-6 inline-flex items-center"
        >
          ← 戻る
        </button>

        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                {pet.name}
              </h2>
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
                <p className="mt-4 text-sm text-neutral-700">{pet.notes}</p>
              )}
            </div>
            <Link to={`/pets/${petId}/edit`}>
              <Button variant="secondary">編集</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft">
        <div className="p-6 md:p-8 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="text-2xl font-bold text-neutral-900">
              カルテ (記録一覧)
            </h3>
            <Link to={`/pets/${petId}/records/new`}>
              <Button>記録を追加</Button>
            </Link>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 mb-6 text-lg">まだ記録がありません</p>
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
                  className="block border border-neutral-200 rounded-xl p-5 md:p-6 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-neutral-900 text-lg">
                        {formatDate(record.recorded_on)}
                      </p>
                      {record.title && (
                        <p className="text-neutral-700 mt-1">{record.title}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {record.has_weights && (
                        <span className="px-3 py-1.5 bg-primary-100 text-primary-800 rounded-lg font-medium">
                          体重
                        </span>
                      )}
                      {record.has_medications && (
                        <span className="px-3 py-1.5 bg-primary-100 text-primary-800 rounded-lg font-medium">
                          投薬
                        </span>
                      )}
                      {record.has_vet_visits && (
                        <span className="px-3 py-1.5 bg-primary-100 text-primary-800 rounded-lg font-medium">
                          通院
                        </span>
                      )}
                    </div>
                  </div>
                  {(record.condition_level ||
                    record.appetite_level ||
                    record.stool_level) && (
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
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
