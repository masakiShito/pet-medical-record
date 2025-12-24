import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getRecord } from '../utils/api';
import { formatDate, formatDateTime } from '../utils/dateFormatter';
import Button from '../components/Button';

export default function RecordDetailPage() {
  const { petId, recordId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecord();
  }, [petId, recordId]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const data = await getRecord(petId, recordId);
      setRecord(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">エラー: {error || '記録が見つかりません'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← 戻る
        </button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {formatDate(record.recorded_on)}
            </h2>
            {record.title && (
              <p className="text-xl text-gray-700 mt-2">{record.title}</p>
            )}
          </div>
          <Link to={`/pets/${petId}/records/${recordId}/edit`}>
            <Button variant="secondary">編集</Button>
          </Link>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>

        <dl className="grid grid-cols-2 gap-4 text-sm">
          {record.condition_level && (
            <div>
              <dt className="text-gray-600">体調レベル</dt>
              <dd className="text-gray-900 font-medium">
                {record.condition_level} / 5
              </dd>
            </div>
          )}
          {record.appetite_level && (
            <div>
              <dt className="text-gray-600">食欲レベル</dt>
              <dd className="text-gray-900 font-medium">
                {record.appetite_level} / 5
              </dd>
            </div>
          )}
          {record.stool_level && (
            <div>
              <dt className="text-gray-600">便の状態</dt>
              <dd className="text-gray-900 font-medium">
                {record.stool_level} / 5
              </dd>
            </div>
          )}
        </dl>

        {record.memo && (
          <div className="mt-4">
            <dt className="text-sm text-gray-600 mb-1">メモ</dt>
            <dd className="text-gray-900 whitespace-pre-wrap">{record.memo}</dd>
          </div>
        )}
      </div>

      {/* Weights */}
      {record.weights && record.weights.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">体重記録</h3>

          <div className="space-y-4">
            {record.weights.map((weight, index) => (
              <div key={weight.id || index} className="border-t pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-baseline space-x-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {weight.weight_kg} kg
                  </span>
                  {weight.measured_at && (
                    <span className="text-sm text-gray-600">
                      {formatDateTime(weight.measured_at)}
                    </span>
                  )}
                </div>
                {weight.note && (
                  <p className="text-sm text-gray-700 mt-2">{weight.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medications */}
      {record.medications && record.medications.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">投薬記録</h3>

          <div className="space-y-4">
            {record.medications.map((med, index) => (
              <div key={med.id || index} className="border-t pt-4 first:border-t-0 first:pt-0">
                <h4 className="font-semibold text-gray-900 mb-2">{med.name}</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {med.dosage && (
                    <div>
                      <dt className="text-gray-600">用量</dt>
                      <dd className="text-gray-900">{med.dosage}</dd>
                    </div>
                  )}
                  {med.frequency && (
                    <div>
                      <dt className="text-gray-600">頻度</dt>
                      <dd className="text-gray-900">{med.frequency}</dd>
                    </div>
                  )}
                  {med.started_on && (
                    <div>
                      <dt className="text-gray-600">開始日</dt>
                      <dd className="text-gray-900">{formatDate(med.started_on)}</dd>
                    </div>
                  )}
                  {med.ended_on && (
                    <div>
                      <dt className="text-gray-600">終了日</dt>
                      <dd className="text-gray-900">{formatDate(med.ended_on)}</dd>
                    </div>
                  )}
                </dl>
                {med.note && (
                  <p className="text-sm text-gray-700 mt-2">{med.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vet Visits */}
      {record.vet_visits && record.vet_visits.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">通院記録</h3>

          <div className="space-y-4">
            {record.vet_visits.map((visit, index) => (
              <div key={visit.id || index} className="border-t pt-4 first:border-t-0 first:pt-0">
                <dl className="space-y-2 text-sm">
                  {visit.hospital_name && (
                    <div>
                      <dt className="text-gray-600">病院名</dt>
                      <dd className="text-gray-900 font-medium">{visit.hospital_name}</dd>
                    </div>
                  )}
                  {visit.doctor && (
                    <div>
                      <dt className="text-gray-600">獣医師名</dt>
                      <dd className="text-gray-900">{visit.doctor}</dd>
                    </div>
                  )}
                  {visit.reason && (
                    <div>
                      <dt className="text-gray-600">受診理由</dt>
                      <dd className="text-gray-900">{visit.reason}</dd>
                    </div>
                  )}
                  {visit.diagnosis && (
                    <div>
                      <dt className="text-gray-600">診断結果</dt>
                      <dd className="text-gray-900">{visit.diagnosis}</dd>
                    </div>
                  )}
                  {visit.cost_yen !== null && visit.cost_yen !== undefined && (
                    <div>
                      <dt className="text-gray-600">費用</dt>
                      <dd className="text-gray-900 font-medium">
                        ¥{visit.cost_yen.toLocaleString()}
                      </dd>
                    </div>
                  )}
                  {visit.note && (
                    <div>
                      <dt className="text-gray-600">メモ</dt>
                      <dd className="text-gray-900 whitespace-pre-wrap">{visit.note}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>作成: {formatDateTime(record.created_at)}</p>
        <p>更新: {formatDateTime(record.updated_at)}</p>
      </div>
    </div>
  );
}
