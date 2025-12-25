import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPets, getPetSummary, Pet, PetSummary } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

interface PetWithSummary {
  pet: Pet;
  summary: PetSummary | null;
}

export default function HomePage() {
  const [petsWithSummary, setPetsWithSummary] = useState<PetWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const petsData = await getPets();
      const pets = petsData.items || [];

      // Load summary for each pet
      const petsWithSummaryData: PetWithSummary[] = [];
      for (const pet of pets) {
        try {
          const summaryData = await getPetSummary(pet.id);
          petsWithSummaryData.push({
            pet,
            summary: summaryData.item,
          });
        } catch (err) {
          console.error(`Error loading summary for pet ${pet.id}:`, err);
          petsWithSummaryData.push({
            pet,
            summary: null,
          });
        }
      }
      setPetsWithSummary(petsWithSummaryData);
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
        <button
          onClick={loadHomeData}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          再試行
        </button>
      </div>
    );
  }

  if (petsWithSummary.length === 0) {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">ホーム</h1>
        <Link to="/pets/new">
          <Button variant="secondary">＋ ペット追加</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {petsWithSummary.map(({ pet, summary }) => (
          <div
            key={pet.id}
            className="bg-white rounded-xl shadow-soft p-6 md:p-8 transition-all duration-150 hover:shadow-soft-md"
          >
            {/* ペット情報 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-semibold text-neutral-900">
                  {pet.name}
                </h2>
                <Link
                  to={`/pets/${pet.id}/edit`}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  編集
                </Link>
              </div>
              {pet.species && (
                <p className="text-sm text-neutral-600">{pet.species}</p>
              )}
            </div>

            {/* サマリ情報 */}
            {summary ? (
              <div className="space-y-4 mb-6">
                {/* 直近通院 */}
                <div className="border-l-4 border-primary-500 pl-4">
                  <p className="text-xs text-neutral-500 mb-1">直近通院</p>
                  {summary.vet_visit_last ? (
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {formatDate(summary.vet_visit_last.visited_on)}
                      </p>
                      {summary.vet_visit_last.hospital_name && (
                        <p className="text-xs text-neutral-600">
                          {summary.vet_visit_last.hospital_name}
                        </p>
                      )}
                      {summary.vet_visit_last.diagnosis && (
                        <p className="text-xs text-neutral-600">
                          {summary.vet_visit_last.diagnosis}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">未登録</p>
                  )}
                </div>

                {/* 直近体重 */}
                <div className="border-l-4 border-success-500 pl-4">
                  <p className="text-xs text-neutral-500 mb-1">直近体重</p>
                  {summary.weight_last ? (
                    <p className="text-sm font-medium text-neutral-900">
                      {summary.weight_last.weight_kg} kg
                      <span className="text-xs text-neutral-500 ml-2">
                        ({formatDate(summary.weight_last.measured_on)})
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-400">未登録</p>
                  )}
                </div>

                {/* 継続投薬 */}
                <div className="border-l-4 border-warning-500 pl-4">
                  <p className="text-xs text-neutral-500 mb-1">継続投薬</p>
                  {summary.medication_active.count > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {summary.medication_active.count} 件
                      </p>
                      {summary.medication_active.items.slice(0, 2).map((med) => (
                        <p key={med.med_id} className="text-xs text-neutral-600">
                          {med.name}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">なし</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-sm text-neutral-400">
                  サマリ情報の取得に失敗しました
                </p>
              </div>
            )}

            {/* クイックアクション */}
            <div className="space-y-2">
              <Link to={`/pets/${pet.id}`}>
                <Button variant="primary" className="w-full">
                  ダッシュボードを見る
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link to={`/pets/${pet.id}/vet-visits`}>
                  <Button variant="secondary" className="w-full text-sm">
                    通院
                  </Button>
                </Link>
                <Link to={`/pets/${pet.id}/weights`}>
                  <Button variant="secondary" className="w-full text-sm">
                    体重
                  </Button>
                </Link>
                <Link to={`/pets/${pet.id}/medications`}>
                  <Button variant="secondary" className="w-full text-sm">
                    投薬
                  </Button>
                </Link>
                <Link to={`/pets/${pet.id}/history`}>
                  <Button variant="secondary" className="w-full text-sm">
                    履歴
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
