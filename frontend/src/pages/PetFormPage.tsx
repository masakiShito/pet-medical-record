import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPet, createPet, updatePet } from '../utils/api';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

interface PetFormData {
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  sex: 'unknown' | 'male' | 'female';
  birthday: string;
  notes: string;
}

export default function PetFormPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(petId);

  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: 'dog',
    breed: '',
    sex: 'unknown',
    birthday: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && petId) {
      loadPet();
    }
  }, [petId]);

  const loadPet = async () => {
    if (!petId) return;

    try {
      setLoading(true);
      const data = await getPet(Number(petId));
      setFormData({
        name: data.name || '',
        species: data.species || 'dog',
        breed: data.breed || '',
        sex: data.sex || 'unknown',
        birthday: data.birthday || '',
        notes: data.notes || '',
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        breed: formData.breed || undefined,
        birthday: formData.birthday || undefined,
        notes: formData.notes || undefined,
      };

      if (isEdit && petId) {
        await updatePet(Number(petId), submitData);
      } else {
        await createPet(submitData);
      }

      navigate('/pets');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'ペット情報編集' : '新しいペットを登録'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        <Input
          label="ペット名"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="例: ポチ"
        />

        <Select
          label="種別"
          name="species"
          value={formData.species}
          onChange={handleChange}
          required
          options={[
            { value: 'dog', label: '犬' },
            { value: 'cat', label: '猫' },
            { value: 'other', label: 'その他' },
          ]}
        />

        <Input
          label="品種"
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          placeholder="例: 柴犬"
        />

        <Select
          label="性別"
          name="sex"
          value={formData.sex}
          onChange={handleChange}
          options={[
            { value: 'unknown', label: '不明' },
            { value: 'male', label: 'オス' },
            { value: 'female', label: 'メス' },
          ]}
        />

        <Input
          label="誕生日"
          name="birthday"
          type="date"
          value={formData.birthday}
          onChange={handleChange}
        />

        <Textarea
          label="メモ"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="特記事項があれば入力してください"
        />

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : isEdit ? '更新する' : '登録する'}
          </Button>
        </div>
      </form>
    </div>
  );
}
