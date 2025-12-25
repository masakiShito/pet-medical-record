import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createWeight, updateWeight, getWeight, deleteWeight, Weight } from '../utils/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';

export default function WeightFormPage() {
  const { petId, weightId } = useParams<{ petId: string; weightId?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Weight>>({
    measured_on: new Date().toISOString().split('T')[0],
    weight_kg: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!weightId;

  useEffect(() => {
    if (weightId && petId) {
      loadWeight(parseInt(petId), parseInt(weightId));
    }
  }, [weightId, petId]);

  const loadWeight = async (pId: number, wId: number) => {
    try {
      const data = await getWeight(pId, wId);
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

      if (isEdit && weightId) {
        await updateWeight(parseInt(petId), parseInt(weightId), formData);
      } else {
        await createWeight(parseInt(petId), formData);
      }

      navigate(`/pets/${petId}/weights`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!petId || !weightId || !confirm('この体重記録を削除しますか？')) return;

    try {
      await deleteWeight(parseInt(petId), parseInt(weightId));
      navigate(`/pets/${petId}/weights`);
    } catch (err) {
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/pets/${petId}/weights`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← 体重一覧に戻る
      </Link>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">
        {isEdit ? '体重を編集' : '体重を追加'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-soft p-6 md:p-8 space-y-6">
        <Input
          label="計測日"
          type="date"
          value={formData.measured_on || ''}
          onChange={(e) => setFormData({ ...formData, measured_on: e.target.value })}
          required
        />

        <Input
          label="体重（kg）"
          type="number"
          step="0.01"
          value={formData.weight_kg || ''}
          onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 0 })}
          required
        />

        <Textarea
          label="メモ"
          value={formData.note || ''}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="計測時の様子など"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? '保存中...' : '保存'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/pets/${petId}/weights`)}
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
