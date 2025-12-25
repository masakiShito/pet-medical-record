import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createMedication, updateMedication, getMedication, deleteMedication, Medication } from '../utils/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';

export default function MedicationFormPage() {
  const { petId, medId } = useParams<{ petId: string; medId?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Medication>>({
    start_on: new Date().toISOString().split('T')[0],
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!medId;

  useEffect(() => {
    if (medId && petId) {
      loadMedication(parseInt(petId), parseInt(medId));
    }
  }, [medId, petId]);

  const loadMedication = async (pId: number, mId: number) => {
    try {
      const data = await getMedication(pId, mId);
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

      if (isEdit && medId) {
        await updateMedication(parseInt(petId), parseInt(medId), formData);
      } else {
        await createMedication(parseInt(petId), formData);
      }

      navigate(`/pets/${petId}/medications`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!petId || !medId || !confirm('この投薬記録を削除しますか？')) return;

    try {
      await deleteMedication(parseInt(petId), parseInt(medId));
      navigate(`/pets/${petId}/medications`);
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/pets/${petId}/medications`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← 投薬一覧に戻る
      </Link>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        {isEdit ? '投薬を編集' : '投薬を追加'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 md:p-8 space-y-6">
        <Input
          label="薬名"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="用量"
          value={formData.dosage || ''}
          onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
          placeholder="例: 1/2錠"
        />

        <Input
          label="頻度"
          value={formData.frequency || ''}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          placeholder="例: 1日2回"
        />

        <Input
          label="開始日"
          type="date"
          value={formData.start_on || ''}
          onChange={(e) => setFormData({ ...formData, start_on: e.target.value })}
          required
        />

        <Input
          label="終了日"
          type="date"
          value={formData.end_on || ''}
          onChange={(e) => setFormData({ ...formData, end_on: e.target.value || undefined })}
          placeholder="継続中の場合は空欄"
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
            onClick={() => navigate(`/pets/${petId}/medications`)}
            className="flex-1"
          >
            キャンセル
          </Button>
        </div>

        {isEdit && (
          <div className="pt-6 border-t border-neutral-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              削除
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
