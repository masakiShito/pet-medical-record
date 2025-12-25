import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createVetVisit, updateVetVisit, getVetVisit, VetVisit } from '../utils/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';

export default function VetVisitFormPage() {
  const { petId, visitId } = useParams<{ petId: string; visitId?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<VetVisit>>({
    visited_on: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!visitId;

  useEffect(() => {
    if (visitId && petId) {
      loadVisit(parseInt(petId), parseInt(visitId));
    }
  }, [visitId, petId]);

  const loadVisit = async (pId: number, vId: number) => {
    try {
      const data = await getVetVisit(pId, vId);
      setFormData(data.item);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId) return;

    try {
      setLoading(true);
      setError(null);

      if (isEdit && visitId) {
        await updateVetVisit(parseInt(petId), parseInt(visitId), formData);
      } else {
        await createVetVisit(parseInt(petId), formData);
      }

      navigate(`/pets/${petId}/vet-visits`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/pets/${petId}/vet-visits`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← 通院一覧に戻る
      </Link>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        {isEdit ? '通院を編集' : '通院を追加'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 md:p-8 space-y-6">
        <Input
          label="受診日"
          type="date"
          value={formData.visited_on || ''}
          onChange={(e) => setFormData({ ...formData, visited_on: e.target.value })}
          required
        />

        <Input
          label="病院名"
          value={formData.hospital_name || ''}
          onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
        />

        <Input
          label="医師名"
          value={formData.doctor_name || ''}
          onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
        />

        <Textarea
          label="主訴"
          value={formData.chief_complaint || ''}
          onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
          placeholder="どのような症状で受診したか"
        />

        <Textarea
          label="診断"
          value={formData.diagnosis || ''}
          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
          placeholder="医師の診断内容"
        />

        <Input
          label="費用（円）"
          type="number"
          value={formData.cost_yen || ''}
          onChange={(e) => setFormData({ ...formData, cost_yen: parseInt(e.target.value) || undefined })}
        />

        <Textarea
          label="メモ"
          value={formData.note || ''}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? '保存中...' : '保存'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/pets/${petId}/vet-visits`)}
            className="flex-1"
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
