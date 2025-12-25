import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPet, getVetVisits, Pet, VetVisit } from '../utils/api';
import { formatDate } from '../utils/dateFormatter';
import Button from '../components/Button';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export default function MedicalHistoryPdfPage() {
  const { petId } = useParams<{ petId: string }>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [visits, setVisits] = useState<VetVisit[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!petId) return;

    const load = async () => {
      try {
        setLoadState('loading');
        const petResponse = await getPet(Number(petId));
        const visitItems = await fetchAllVetVisits(Number(petId));
        setPet(petResponse.item);
        setVisits(visitItems);
        setLoadState('ready');
      } catch (err) {
        setError((err as Error).message);
        setLoadState('error');
      }
    };

    load();
  }, [petId]);

  const sortedVisits = useMemo(
    () => [...visits].sort((a, b) => b.visited_on.localeCompare(a.visited_on)),
    [visits]
  );

  const diseaseHistory = useMemo(
    () =>
      sortedVisits
        .filter((visit) => visit.diagnosis)
        .map((visit) => ({
          id: visit.id,
          visited_on: visit.visited_on,
          diagnosis: visit.diagnosis as string,
          hospital_name: visit.hospital_name,
        })),
    [sortedVisits]
  );

  const handleDownload = async () => {
    if (!pdfRef.current || !pet) return;
    window.print();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 print-hidden">
        <Link to={`/pets/${petId}`} className="text-sm text-neutral-600 hover:text-neutral-800">
          ← ダッシュボードに戻る
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-bold text-neutral-900">病気・通院履歴PDF</h1>
          <Button onClick={handleDownload} disabled={loadState !== 'ready'}>
            PDFとして保存
          </Button>
        </div>
      </div>

      {loadState === 'loading' && (
        <div className="text-center py-12">
          <p className="text-neutral-600">読み込み中...</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className="text-center py-12">
          <p className="text-red-600">エラー: {error}</p>
        </div>
      )}

      {loadState === 'ready' && pet && (
        <div
          ref={pdfRef}
          className="bg-white shadow-soft rounded-xl p-8 pdf-print-container"
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          <div className="border-b border-neutral-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">{pet.name}の病気・通院履歴</h2>
            <div className="mt-3 text-sm text-neutral-600 space-y-1">
              {pet.species && <p>種類: {pet.species}</p>}
              {pet.birth_date && <p>生年月日: {formatDate(pet.birth_date)}</p>}
              <p>発行日: {formatDate(new Date().toISOString().slice(0, 10))}</p>
            </div>
          </div>

          <section className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">病気の履歴</h3>
            {diseaseHistory.length === 0 ? (
              <p className="text-sm text-neutral-500">診断履歴がありません。</p>
            ) : (
              <table className="w-full text-sm border border-neutral-200">
                <thead className="bg-neutral-100">
                  <tr>
                    <th className="text-left p-3 border-b border-neutral-200">日付</th>
                    <th className="text-left p-3 border-b border-neutral-200">診断内容</th>
                    <th className="text-left p-3 border-b border-neutral-200">病院名</th>
                  </tr>
                </thead>
                <tbody>
                  {diseaseHistory.map((item) => (
                    <tr key={item.id} className="border-b border-neutral-200 last:border-b-0">
                      <td className="p-3 align-top">{formatDate(item.visited_on)}</td>
                      <td className="p-3 align-top">{item.diagnosis}</td>
                      <td className="p-3 align-top">{item.hospital_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">通院記録</h3>
            {sortedVisits.length === 0 ? (
              <p className="text-sm text-neutral-500">通院記録がありません。</p>
            ) : (
              <div className="space-y-4">
                {sortedVisits.map((visit) => (
                  <div key={visit.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                      <p className="font-semibold text-neutral-900">{formatDate(visit.visited_on)}</p>
                      {visit.cost_yen !== undefined && visit.cost_yen !== null && (
                        <p className="text-neutral-600">¥{visit.cost_yen.toLocaleString()}</p>
                      )}
                    </div>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-neutral-500">病院名</dt>
                        <dd className="text-neutral-900">{visit.hospital_name || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">医師名</dt>
                        <dd className="text-neutral-900">{visit.doctor_name || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">主訴</dt>
                        <dd className="text-neutral-900">{visit.chief_complaint || '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-neutral-500">診断</dt>
                        <dd className="text-neutral-900">{visit.diagnosis || '-'}</dd>
                      </div>
                    </dl>
                    {visit.note && (
                      <div className="mt-3 text-sm">
                        <p className="text-neutral-500">メモ</p>
                        <p className="text-neutral-900 whitespace-pre-wrap">{visit.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

async function fetchAllVetVisits(petId: number): Promise<VetVisit[]> {
  const limit = 100;
  let offset = 0;
  let allVisits: VetVisit[] = [];

  while (true) {
    const data = await getVetVisits(petId, { limit, offset });
    allVisits = allVisits.concat(data.items);

    if (allVisits.length >= data.total || data.items.length === 0) {
      break;
    }

    offset += limit;
  }

  return allVisits;
}
