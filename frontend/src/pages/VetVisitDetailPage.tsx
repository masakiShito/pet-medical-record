import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getVetVisit, deleteVetVisit, VetVisit } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function VetVisitDetailPage() {
  const { petId, visitId } = useParams<{ petId: string; visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VetVisit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId && visitId) {
      loadVisit(parseInt(petId), parseInt(visitId));
    }
  }, [petId, visitId]);

  const loadVisit = async (pId: number, vId: number) => {
    try {
      const data = await getVetVisit(pId, vId);
      setVisit(data.item);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!petId || !visitId || !confirm('この通院記録を削除しますか？')) return;

    try {
      await deleteVetVisit(parseInt(petId), parseInt(visitId));
      navigate(`/pets/${petId}/vet-visits`);
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-neutral-600">読み込み中...</p></div>;
  }

  if (!visit) {
    return <div className="text-center py-12"><p className="text-red-600">通院記録が見つかりません</p></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/pets/${petId}/vet-visits`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← 通院一覧に戻る
      </Link>

      <div className="bg-white rounded-lg shadow-soft p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">{formatDate(visit.visited_on)}</h1>
          <Link to={`/pets/${petId}/vet-visits/${visitId}/edit`}>
            <Button variant="secondary" className="text-sm">編集</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {visit.hospital_name && (
            <div>
              <p className="text-sm text-neutral-500">病院名</p>
              <p className="text-neutral-900">{visit.hospital_name}</p>
            </div>
          )}

          {visit.doctor_name && (
            <div>
              <p className="text-sm text-neutral-500">医師名</p>
              <p className="text-neutral-900">{visit.doctor_name}</p>
            </div>
          )}

          {visit.chief_complaint && (
            <div>
              <p className="text-sm text-neutral-500">主訴</p>
              <p className="text-neutral-900">{visit.chief_complaint}</p>
            </div>
          )}

          {visit.diagnosis && (
            <div>
              <p className="text-sm text-neutral-500">診断</p>
              <p className="text-neutral-900">{visit.diagnosis}</p>
            </div>
          )}

          {visit.cost_yen && (
            <div>
              <p className="text-sm text-neutral-500">費用</p>
              <p className="text-neutral-900">¥{visit.cost_yen.toLocaleString()}</p>
            </div>
          )}

          {visit.note && (
            <div>
              <p className="text-sm text-neutral-500">メモ</p>
              <p className="text-neutral-900 whitespace-pre-wrap">{visit.note}</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Button
            variant="secondary"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            削除
          </Button>
        </div>
      </div>
    </div>
  );
}
