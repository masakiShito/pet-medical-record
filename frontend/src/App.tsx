import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PetListPage from './pages/PetListPage';
import PetFormPage from './pages/PetFormPage';
import PetDashboardPage from './pages/PetDashboardPage';
import RecordTimelinePage from './pages/RecordTimelinePage';
import RecordDetailPage from './pages/RecordDetailPage';
import RecordFormPage from './pages/RecordFormPage';
import VetVisitListPage from './pages/VetVisitListPage';
import VetVisitFormPage from './pages/VetVisitFormPage';
import VetVisitDetailPage from './pages/VetVisitDetailPage';
import WeightListPage from './pages/WeightListPage';
import WeightFormPage from './pages/WeightFormPage';
import MedicationListPage from './pages/MedicationListPage';
import MedicationFormPage from './pages/MedicationFormPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* S01: ホーム */}
          <Route path="/" element={<HomePage />} />

          {/* S02: ペット一覧 */}
          <Route path="/pets" element={<PetListPage />} />

          {/* S03: ペット登録編集 */}
          <Route path="/pets/new" element={<PetFormPage />} />
          <Route path="/pets/:petId/edit" element={<PetFormPage />} />

          {/* S04: ペットダッシュボード */}
          <Route path="/pets/:petId" element={<PetDashboardPage />} />

          {/* S05: 履歴タイムライン */}
          <Route path="/pets/:petId/history" element={<RecordTimelinePage />} />

          {/* S06: 記録詳細 */}
          <Route path="/pets/:petId/records/:recordId" element={<RecordDetailPage />} />

          {/* S07-S09: 通院 */}
          <Route path="/pets/:petId/vet-visits" element={<VetVisitListPage />} />
          <Route path="/pets/:petId/vet-visits/new" element={<VetVisitFormPage />} />
          <Route path="/pets/:petId/vet-visits/:visitId" element={<VetVisitDetailPage />} />
          <Route path="/pets/:petId/vet-visits/:visitId/edit" element={<VetVisitFormPage />} />

          {/* S10-S11: 体重 */}
          <Route path="/pets/:petId/weights" element={<WeightListPage />} />
          <Route path="/pets/:petId/weights/new" element={<WeightFormPage />} />
          <Route path="/pets/:petId/weights/:weightId/edit" element={<WeightFormPage />} />

          {/* S12-S13: 投薬 */}
          <Route path="/pets/:petId/medications" element={<MedicationListPage />} />
          <Route path="/pets/:petId/medications/new" element={<MedicationFormPage />} />
          <Route path="/pets/:petId/medications/:medId/edit" element={<MedicationFormPage />} />

          {/* S14: まとめて記録 */}
          <Route path="/pets/:petId/records/new" element={<RecordFormPage />} />
          <Route path="/pets/:petId/records/:recordId/edit" element={<RecordFormPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
