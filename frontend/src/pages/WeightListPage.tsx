import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWeights, Weight } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function WeightListPage() {
  const { petId } = useParams<{ petId: string }>();
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      loadWeights(parseInt(petId));
    }
  }, [petId]);

  const loadWeights = async (id: number) => {
    try {
      const data = await getWeights(id, { limit: 200 });
      setWeights(data.items);
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
        <h1 className="text-3xl font-bold text-neutral-900">体重一覧</h1>
        <Link to={`/pets/${petId}/weights/new`}>
          <Button>体重を追加</Button>
        </Link>
      </div>

      {weights.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">まだ体重記録がありません</p>
          <Link to={`/pets/${petId}/weights/new`}>
            <Button>最初の体重を追加</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {weights.map((weight) => (
            <Link
              key={weight.id}
              to={`/pets/${petId}/weights/${weight.id}/edit`}
              className="block bg-white rounded-lg shadow-soft p-4 hover:shadow-soft-md transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-neutral-900">{weight.weight_kg} kg</p>
                  <p className="text-sm text-neutral-600">{formatDate(weight.measured_on)}</p>
                  {weight.note && <p className="text-sm text-neutral-500 mt-1">{weight.note}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
