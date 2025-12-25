import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMedications, Medication } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function MedicationListPage() {
  const { petId } = useParams<{ petId: string }>();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      loadMedications(parseInt(petId));
    }
  }, [petId]);

  const loadMedications = async (id: number) => {
    try {
      const data = await getMedications(id, { limit: 100 });
      setMedications(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-neutral-600">読み込み中...</p></div>;
  }

  const activeMeds = medications.filter(m => !m.end_on || new Date(m.end_on) >= new Date());
  const pastMeds = medications.filter(m => m.end_on && new Date(m.end_on) < new Date());

  return (
    <div>
      <Link to={`/pets/${petId}`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← ダッシュボードに戻る
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">投薬一覧</h1>
        <Link to={`/pets/${petId}/medications/new`}>
          <Button>投薬を追加</Button>
        </Link>
      </div>

      {medications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">まだ投薬記録がありません</p>
          <Link to={`/pets/${petId}/medications/new`}>
            <Button>最初の投薬を追加</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeMeds.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">継続中</h2>
              <div className="space-y-3">
                {activeMeds.map((med) => (
                  <Link
                    key={med.id}
                    to={`/pets/${petId}/medications/${med.id}/edit`}
                    className="block bg-white rounded-lg shadow-soft p-4 hover:shadow-soft-md transition-all border-l-4 border-warning-500"
                  >
                    <p className="font-semibold text-neutral-900">{med.name}</p>
                    {med.dosage && <p className="text-sm text-neutral-600">用量: {med.dosage}</p>}
                    {med.frequency && <p className="text-sm text-neutral-600">頻度: {med.frequency}</p>}
                    <p className="text-sm text-neutral-500 mt-1">
                      {formatDate(med.start_on)} 〜 継続中
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {pastMeds.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">終了</h2>
              <div className="space-y-3">
                {pastMeds.map((med) => (
                  <Link
                    key={med.id}
                    to={`/pets/${petId}/medications/${med.id}/edit`}
                    className="block bg-white rounded-lg shadow-soft p-4 hover:shadow-soft-md transition-all opacity-60"
                  >
                    <p className="font-semibold text-neutral-900">{med.name}</p>
                    {med.dosage && <p className="text-sm text-neutral-600">用量: {med.dosage}</p>}
                    <p className="text-sm text-neutral-500 mt-1">
                      {formatDate(med.start_on)} 〜 {med.end_on && formatDate(med.end_on)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
