import { useParams, Link } from 'react-router-dom';

export default function RecordTimelinePage() {
  const { petId } = useParams<{ petId: string }>();

  return (
    <div>
      <Link to={`/pets/${petId}`} className="text-sm text-neutral-600 hover:text-neutral-800 mb-4 inline-block">
        ← ダッシュボードに戻る
      </Link>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">履歴（タイムライン）</h1>
      <p className="text-neutral-600">実装予定：日付でまとめた記録の履歴</p>
    </div>
  );
}
