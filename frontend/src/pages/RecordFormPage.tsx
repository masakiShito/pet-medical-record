import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecord, createRecord, updateRecord, deleteRecord, Weight, Medication, VetVisit } from '../utils/api';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';

interface RecordFormData {
  recorded_on: string;
  title: string;
  condition_level: string;
  appetite_level: string;
  stool_level: string;
  memo: string;
  weights: Weight[];
  medications: Medication[];
  vet_visits: VetVisit[];
}

export default function RecordFormPage() {
  const { petId, recordId } = useParams<{ petId: string; recordId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(recordId);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<RecordFormData>({
    recorded_on: today,
    title: '',
    condition_level: '',
    appetite_level: '',
    stool_level: '',
    memo: '',
    weights: [],
    medications: [],
    vet_visits: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && petId && recordId) {
      loadRecord();
    }
  }, [recordId]);

  const loadRecord = async () => {
    if (!petId || !recordId) return;

    try {
      setLoading(true);
      const data = await getRecord(Number(petId), Number(recordId));
      setFormData({
        recorded_on: data.recorded_on || today,
        title: data.title || '',
        condition_level: data.condition_level?.toString() || '',
        appetite_level: data.appetite_level?.toString() || '',
        stool_level: data.stool_level?.toString() || '',
        memo: data.memo || '',
        weights: data.weights || [],
        medications: data.medications || [],
        vet_visits: data.vet_visits || [],
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

  // Weight handlers
  const addWeight = () => {
    setFormData((prev) => ({
      ...prev,
      weights: [...prev.weights, { weight_kg: 0, measured_at: '', note: '' }],
    }));
  };

  const updateWeight = (index: number, field: keyof Weight, value: string | number) => {
    setFormData((prev) => {
      const newWeights = [...prev.weights];
      newWeights[index] = { ...newWeights[index], [field]: value };
      return { ...prev, weights: newWeights };
    });
  };

  const removeWeight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      weights: prev.weights.filter((_, i) => i !== index),
    }));
  };

  // Medication handlers
  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        { name: '', dosage: '', frequency: '', started_on: '', ended_on: '', note: '' },
      ],
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setFormData((prev) => {
      const newMedications = [...prev.medications];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return { ...prev, medications: newMedications };
    });
  };

  const removeMedication = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  // Vet visit handlers
  const addVetVisit = () => {
    setFormData((prev) => ({
      ...prev,
      vet_visits: [
        ...prev.vet_visits,
        { hospital_name: '', doctor: '', reason: '', diagnosis: '', cost_yen: undefined, note: '' },
      ],
    }));
  };

  const updateVetVisit = (index: number, field: keyof VetVisit, value: string | number) => {
    setFormData((prev) => {
      const newVetVisits = [...prev.vet_visits];
      newVetVisits[index] = { ...newVetVisits[index], [field]: value };
      return { ...prev, vet_visits: newVetVisits };
    });
  };

  const removeVetVisit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      vet_visits: prev.vet_visits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!petId) return;

    setError(null);

    try {
      setLoading(true);

      const submitData = {
        recorded_on: formData.recorded_on,
        title: formData.title || undefined,
        condition_level: formData.condition_level ? Number(formData.condition_level) : undefined,
        appetite_level: formData.appetite_level ? Number(formData.appetite_level) : undefined,
        stool_level: formData.stool_level ? Number(formData.stool_level) : undefined,
        memo: formData.memo || undefined,
        weights: formData.weights.map((w) => ({
          id: w.id,
          weight_kg: Number(w.weight_kg),
          measured_at: w.measured_at || undefined,
          note: w.note || undefined,
        })),
        medications: formData.medications.map((m) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage || undefined,
          frequency: m.frequency || undefined,
          started_on: m.started_on || undefined,
          ended_on: m.ended_on || undefined,
          note: m.note || undefined,
        })),
        vet_visits: formData.vet_visits.map((v) => ({
          id: v.id,
          hospital_name: v.hospital_name || undefined,
          doctor: v.doctor || undefined,
          reason: v.reason || undefined,
          diagnosis: v.diagnosis || undefined,
          cost_yen: v.cost_yen ? Number(v.cost_yen) : undefined,
          note: v.note || undefined,
        })),
      };

      if (isEdit && recordId) {
        await updateRecord(Number(petId), Number(recordId), submitData);
      } else {
        await createRecord(Number(petId), submitData);
      }

      navigate(`/pets/${petId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!petId || !recordId) return;
    if (!window.confirm('この記録を削除してもよろしいですか?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteRecord(Number(petId), Number(recordId));
      navigate(`/pets/${petId}`);
    } catch (err) {
      setError((err as Error).message);
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? '記録を編集' : '新しい記録を追加'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>

          <Input
            label="記録日"
            name="recorded_on"
            type="date"
            value={formData.recorded_on}
            onChange={handleChange}
            required
          />

          <Input
            label="タイトル"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="例: 下痢気味"
          />

          <Select
            label="体調レベル"
            name="condition_level"
            value={formData.condition_level}
            onChange={handleChange}
            options={[
              { value: '', label: '選択してください' },
              { value: '1', label: '1 - 悪い' },
              { value: '2', label: '2' },
              { value: '3', label: '3 - 普通' },
              { value: '4', label: '4' },
              { value: '5', label: '5 - 良い' },
            ]}
          />

          <Select
            label="食欲レベル"
            name="appetite_level"
            value={formData.appetite_level}
            onChange={handleChange}
            options={[
              { value: '', label: '選択してください' },
              { value: '1', label: '1 - 悪い' },
              { value: '2', label: '2' },
              { value: '3', label: '3 - 普通' },
              { value: '4', label: '4' },
              { value: '5', label: '5 - 良い' },
            ]}
          />

          <Select
            label="便の状態"
            name="stool_level"
            value={formData.stool_level}
            onChange={handleChange}
            options={[
              { value: '', label: '選択してください' },
              { value: '1', label: '1 - 悪い' },
              { value: '2', label: '2' },
              { value: '3', label: '3 - 普通' },
              { value: '4', label: '4' },
              { value: '5', label: '5 - 良い' },
            ]}
          />

          <Textarea
            label="メモ"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            placeholder="気になることがあれば記録してください"
          />
        </div>

        {/* Weights */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">体重記録</h3>
            <Button type="button" variant="secondary" onClick={addWeight}>
              追加
            </Button>
          </div>

          {formData.weights.map((weight, index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:mt-0">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="体重 (kg)"
                  type="number"
                  name="weight_kg"
                  value={weight.weight_kg || ''}
                  onChange={(e) => updateWeight(index, 'weight_kg', e.target.value)}
                  required
                />
                <Input
                  label="測定日時"
                  type="datetime-local"
                  name="measured_at"
                  value={weight.measured_at || ''}
                  onChange={(e) => updateWeight(index, 'measured_at', e.target.value)}
                />
              </div>
              <Input
                label="メモ"
                name="note"
                value={weight.note || ''}
                onChange={(e) => updateWeight(index, 'note', e.target.value)}
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => removeWeight(index)}
                className="mt-2"
              >
                削除
              </Button>
            </div>
          ))}
        </div>

        {/* Medications */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">投薬記録</h3>
            <Button type="button" variant="secondary" onClick={addMedication}>
              追加
            </Button>
          </div>

          {formData.medications.map((med, index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:mt-0">
              <Input
                label="薬名"
                name="name"
                value={med.name}
                onChange={(e) => updateMedication(index, 'name', e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="用量"
                  name="dosage"
                  value={med.dosage || ''}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                />
                <Input
                  label="頻度"
                  name="frequency"
                  value={med.frequency || ''}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="開始日"
                  type="date"
                  name="started_on"
                  value={med.started_on || ''}
                  onChange={(e) => updateMedication(index, 'started_on', e.target.value)}
                />
                <Input
                  label="終了日"
                  type="date"
                  name="ended_on"
                  value={med.ended_on || ''}
                  onChange={(e) => updateMedication(index, 'ended_on', e.target.value)}
                />
              </div>
              <Input
                label="メモ"
                name="note"
                value={med.note || ''}
                onChange={(e) => updateMedication(index, 'note', e.target.value)}
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => removeMedication(index)}
                className="mt-2"
              >
                削除
              </Button>
            </div>
          ))}
        </div>

        {/* Vet Visits */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">通院記録</h3>
            <Button type="button" variant="secondary" onClick={addVetVisit}>
              追加
            </Button>
          </div>

          {formData.vet_visits.map((visit, index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:mt-0">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="病院名"
                  name="hospital_name"
                  value={visit.hospital_name || ''}
                  onChange={(e) => updateVetVisit(index, 'hospital_name', e.target.value)}
                />
                <Input
                  label="獣医師名"
                  name="doctor"
                  value={visit.doctor || ''}
                  onChange={(e) => updateVetVisit(index, 'doctor', e.target.value)}
                />
              </div>
              <Input
                label="受診理由"
                name="reason"
                value={visit.reason || ''}
                onChange={(e) => updateVetVisit(index, 'reason', e.target.value)}
              />
              <Input
                label="診断結果"
                name="diagnosis"
                value={visit.diagnosis || ''}
                onChange={(e) => updateVetVisit(index, 'diagnosis', e.target.value)}
              />
              <Input
                label="費用 (円)"
                type="number"
                name="cost_yen"
                value={visit.cost_yen || ''}
                onChange={(e) => updateVetVisit(index, 'cost_yen', e.target.value)}
              />
              <Textarea
                label="メモ"
                name="note"
                value={visit.note || ''}
                onChange={(e) => updateVetVisit(index, 'note', e.target.value)}
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => removeVetVisit(index)}
                className="mt-2"
              >
                削除
              </Button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {isEdit && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
              >
                記録を削除
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
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
        </div>
      </form>
    </div>
  );
}
