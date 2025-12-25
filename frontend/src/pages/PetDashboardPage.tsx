import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPet, getPetSummary, Pet, PetSummary } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function PetDashboardPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [summary, setSummary] = useState<PetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (petId) {
      loadPetData(parseInt(petId));
    }
  }, [petId]);

  const loadPetData = async (id: number) => {
    try {
      setLoading(true);
      const [petData, summaryData] = await Promise.all([
        getPet(id),
        getPetSummary(id),
      ]);
      setPet(petData.item);
      setSummary(summaryData.item);
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
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/"
            className="text-sm text-neutral-600 hover:text-neutral-800"
          >
            ← ホームに戻る
          </Link>
          <Link
            to={`/pets/${pet.id}/edit`}
            className="text-sm text-neutral-600 hover:text-neutral-800"
          >
            ペット情報を編集
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900">{pet.name}</h1>
        {pet.species && (
          <p className="text-neutral-600 mt-2">{pet.species}</p>
        )}
        {pet.birth_date && (
          <p className="text-sm text-neutral-500 mt-1">
            生年月日: {formatDate(pet.birth_date)}
          </p>
        )}
      </div>

      {/* サマリ領域 */}
      {summary && (
        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">
            最近の状況
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* 直近通院 */}
            <div className="border-l-4 border-primary-500 pl-4">
              <p className="text-sm text-neutral-500 mb-2">直近通院</p>
              {summary.vet_visit_last ? (
                <div>
                  <p className="font-semibold text-neutral-900 mb-1">
                    {formatDate(summary.vet_visit_last.visited_on)}
                  </p>
                  {summary.vet_visit_last.hospital_name && (
                    <p className="text-sm text-neutral-600">
                      {summary.vet_visit_last.hospital_name}
                    </p>
                  )}
                  {summary.vet_visit_last.diagnosis && (
                    <p className="text-sm text-neutral-600">
                      {summary.vet_visit_last.diagnosis}
                    </p>
                  )}
                  {summary.vet_visit_last.cost_yen && (
                    <p className="text-sm text-neutral-500 mt-1">
                      ¥{summary.vet_visit_last.cost_yen.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-neutral-400">未登録</p>
              )}
            </div>

            {/* 直近体重 */}
            <div className="border-l-4 border-success-500 pl-4">
              <p className="text-sm text-neutral-500 mb-2">直近体重</p>
              {summary.weight_last ? (
                <div>
                  <p className="font-semibold text-neutral-900 mb-1">
                    {summary.weight_last.weight_kg} kg
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatDate(summary.weight_last.measured_on)}
                  </p>
                </div>
              ) : (
                <p className="text-neutral-400">未登録</p>
              )}
            </div>

            {/* 継続投薬 */}
            <div className="border-l-4 border-warning-500 pl-4">
              <p className="text-sm text-neutral-500 mb-2">継続投薬</p>
              {summary.medication_active.count > 0 ? (
                <div>
                  <p className="font-semibold text-neutral-900 mb-2">
                    {summary.medication_active.count} 件
                  </p>
                  <div className="space-y-1">
                    {summary.medication_active.items.map((med) => (
                      <p key={med.med_id} className="text-sm text-neutral-600">
                        {med.name}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-neutral-400">なし</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* クイックアクション */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 通院 */}
        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            通院
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            病院での診察・治療の記録を管理します
          </p>
          <div className="space-y-3">
            <Link to={`/pets/${pet.id}/vet-visits/new`}>
              <Button variant="primary" className="w-full">
                通院を追加
              </Button>
            </Link>
            <Link to={`/pets/${pet.id}/vet-visits`}>
              <Button variant="secondary" className="w-full">
                通院一覧を見る
              </Button>
            </Link>
          </div>
        </div>

        {/* 体重 */}
        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            体重
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            定期的な体重測定の記録を管理します
          </p>
          <div className="space-y-3">
            <Link to={`/pets/${pet.id}/weights/new`}>
              <Button variant="primary" className="w-full">
                体重を追加
              </Button>
            </Link>
            <Link to={`/pets/${pet.id}/weights`}>
              <Button variant="secondary" className="w-full">
                体重一覧を見る
              </Button>
            </Link>
          </div>
        </div>

        {/* 投薬 */}
        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            投薬
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            処方された薬の服用記録を管理します
          </p>
          <div className="space-y-3">
            <Link to={`/pets/${pet.id}/medications/new`}>
              <Button variant="primary" className="w-full">
                投薬を追加
              </Button>
            </Link>
            <Link to={`/pets/${pet.id}/medications`}>
              <Button variant="secondary" className="w-full">
                投薬一覧を見る
              </Button>
            </Link>
          </div>
        </div>

        {/* 履歴 */}
        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <h3 className="text-xl font-semibold text-neutral-900 mb-4">
            履歴
          </h3>
          <p className="text-sm text-neutral-600 mb-6">
            日付でまとめて記録を振り返ります
          </p>
          <div className="space-y-3">
            <Link to={`/pets/${pet.id}/history`}>
              <Button variant="secondary" className="w-full">
                履歴を見る
              </Button>
            </Link>
            <Link to={`/pets/${pet.id}/records/new`}>
              <Button variant="secondary" className="w-full text-sm">
                まとめて記録（任意）
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
