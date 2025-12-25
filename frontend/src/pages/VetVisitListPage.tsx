import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVetVisits, VetVisit } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function VetVisitListPage() {
  const { petId } = useParams<{ petId: string }>();
  const [visits, setVisits] = useState<VetVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      loadVisits(parseInt(petId));
    }
  }, [petId]);

  const loadVisits = async (id: number) => {
    try {
      const data = await getVetVisits(id, { limit: 50 });
      setVisits(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-neutral-600">読み込み中...</p></div>;
  }

  return (
    <div>
      <Link to={`/pets/${petId}`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← ダッシュボードに戻る
      </Link>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">通院一覧</h1>
        <Link to={`/pets/${petId}/vet-visits/new`}>
          <Button>通院を追加</Button>
        </Link>
      </div>

      {visits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">まだ通院記録がありません</p>
          <Link to={`/pets/${petId}/vet-visits/new`}>
            <Button>最初の通院を追加</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <Link
              key={visit.id}
              to={`/pets/${petId}/vet-visits/${visit.id}`}
              className="block bg-white rounded-lg shadow-soft p-6 hover:shadow-soft-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-neutral-900">{formatDate(visit.visited_on)}</p>
                {visit.cost_yen && <p className="text-neutral-600">¥{visit.cost_yen.toLocaleString()}</p>}
              </div>
              {visit.hospital_name && <p className="text-sm text-neutral-600">{visit.hospital_name}</p>}
              {visit.diagnosis && <p className="text-sm text-neutral-700 mt-1">{visit.diagnosis}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
