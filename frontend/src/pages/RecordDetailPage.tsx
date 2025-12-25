import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getRecord, Record } from '../utils/api';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function RecordDetailPage() {
  const { petId, recordId } = useParams<{ petId: string; recordId: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecord();
  }, [petId, recordId]);

  const loadRecord = async () => {
    if (!petId || !recordId) return;

    try {
      setLoading(true);
      const data = await getRecord(Number(petId), Number(recordId));
      setRecord(data);
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

  if (error || !record) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">エラー: {error || '記録が見つかりません'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 transition-colors duration-150 mb-6 inline-flex items-center"
        >
          ← 戻る
        </button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-neutral-900">
              {formatDate(record.recorded_on)}
            </h2>
            {record.title && (
              <p className="text-xl text-neutral-700 mt-2">{record.title}</p>
            )}
          </div>
          <Link to={`/pets/${petId}/records/${recordId}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white shadow-soft rounded-xl p-6 md:p-8 mb-6">
        <h3 className="text-xl font-bold text-neutral-900 mb-6">基本情報</h3>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          {record.condition_level && (
            <div>
              <dt className="text-neutral-600 mb-1">体調レベル</dt>
              <dd className="text-neutral-900 font-semibold text-lg">
                {record.condition_level} / 5
              </dd>
            </div>
          )}
          {record.appetite_level && (
            <div>
              <dt className="text-neutral-600 mb-1">食欲レベル</dt>
              <dd className="text-neutral-900 font-semibold text-lg">
                {record.appetite_level} / 5
              </dd>
            </div>
          )}
          {record.stool_level && (
            <div>
              <dt className="text-neutral-600 mb-1">便の状態</dt>
              <dd className="text-neutral-900 font-semibold text-lg">
                {record.stool_level} / 5
              </dd>
            </div>
          )}
        </dl>

        {record.memo && (
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <dt className="text-sm text-neutral-600 mb-2 font-medium">メモ</dt>
            <dd className="text-neutral-900 whitespace-pre-wrap leading-relaxed">{record.memo}</dd>
          </div>
        )}
      </div>

      {/* Weights */}
      {record.weights && record.weights.length > 0 && (
        <div className="bg-white shadow-soft rounded-xl p-6 md:p-8 mb-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">体重記録</h3>

          <div className="space-y-5">
            {record.weights.map((weight, index) => (
              <div key={weight.id || index} className="pb-5 border-b border-neutral-200 last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-4 gap-2">
                  <span className="text-3xl font-bold text-primary-600">
                    {weight.weight_kg} kg
                  </span>
                  {weight.measured_at && (
                    <span className="text-sm text-neutral-600">
                      {formatDateTime(weight.measured_at)}
                    </span>
                  )}
                </div>
                {weight.note && (
                  <p className="text-sm text-neutral-700 mt-3">{weight.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {record.medications && record.medications.length > 0 && (
        <div className="bg-white shadow-soft rounded-xl p-6 md:p-8 mb-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">投薬記録</h3>

          <div className="space-y-6">
            {record.medications.map((med, index) => (
              <div key={med.id || index} className="pb-6 border-b border-neutral-200 last:border-b-0 last:pb-0">
                <h4 className="font-semibold text-neutral-900 mb-4 text-lg">{med.name}</h4>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {med.dosage && (
                    <div>
                      <dt className="text-neutral-600 mb-1">用量</dt>
                      <dd className="text-neutral-900 font-medium">{med.dosage}</dd>
                    </div>
                  )}
                  {med.frequency && (
                    <div>
                      <dt className="text-neutral-600 mb-1">頻度</dt>
                      <dd className="text-neutral-900 font-medium">{med.frequency}</dd>
                    </div>
                  )}
                  {med.started_on && (
                    <div>
                      <dt className="text-neutral-600 mb-1">開始日</dt>
                      <dd className="text-neutral-900 font-medium">{formatDate(med.started_on)}</dd>
                    </div>
                  )}
                  {med.ended_on && (
                    <div>
                      <dt className="text-neutral-600 mb-1">終了日</dt>
                      <dd className="text-neutral-900 font-medium">{formatDate(med.ended_on)}</dd>
                    </div>
                  )}
                </dl>
                {med.note && (
                  <p className="text-sm text-neutral-700 mt-3">{med.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vet Visits */}
      {record.vet_visits && record.vet_visits.length > 0 && (
        <div className="bg-white shadow-soft rounded-xl p-6 md:p-8 mb-6">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">通院記録</h3>

          <div className="space-y-6">
            {record.vet_visits.map((visit, index) => (
              <div key={visit.id || index} className="pb-6 border-b border-neutral-200 last:border-b-0 last:pb-0">
                <dl className="space-y-3 text-sm">
                  {visit.hospital_name && (
                    <div>
                      <dt className="text-neutral-600 mb-1">病院名</dt>
                      <dd className="text-neutral-900 font-semibold text-base">{visit.hospital_name}</dd>
                    </div>
                  )}
                  {visit.doctor && (
                    <div>
                      <dt className="text-neutral-600 mb-1">獣医師名</dt>
                      <dd className="text-neutral-900 font-medium">{visit.doctor}</dd>
                    </div>
                  )}
                  {visit.reason && (
                    <div>
                      <dt className="text-neutral-600 mb-1">受診理由</dt>
                      <dd className="text-neutral-900">{visit.reason}</dd>
                    </div>
                  )}
                  {visit.diagnosis && (
                    <div>
                      <dt className="text-neutral-600 mb-1">診断結果</dt>
                      <dd className="text-neutral-900">{visit.diagnosis}</dd>
                    </div>
                  )}
                  {visit.cost_yen !== null && visit.cost_yen !== undefined && (
                    <div>
                      <dt className="text-neutral-600 mb-1">費用</dt>
                      <dd className="text-neutral-900 font-semibold text-base">
                        ¥{visit.cost_yen.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {visit.note && (
                    <div>
                      <dt className="text-neutral-600 mb-1">メモ</dt>
                      <dd className="text-neutral-900 whitespace-pre-wrap leading-relaxed">{visit.note}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-neutral-500 space-y-1 py-4">
        {record.created_at && <p>作成: {formatDateTime(record.created_at)}</p>}
        {record.updated_at && <p>更新: {formatDateTime(record.updated_at)}</p>}
      </div>
    </div>
  );
}
