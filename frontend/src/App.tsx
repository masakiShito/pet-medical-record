import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PetListPage from './pages/PetListPage';
import PetFormPage from './pages/PetFormPage';
import PetDetailPage from './pages/PetDetailPage';
import RecordFormPage from './pages/RecordFormPage';
import RecordDetailPage from './pages/RecordDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pets" element={<PetListPage />} />
          <Route path="/pets/new" element={<PetFormPage />} />
          <Route path="/pets/:petId" element={<PetDetailPage />} />
          <Route path="/pets/:petId/edit" element={<PetFormPage />} />
          <Route path="/pets/:petId/records/new" element={<RecordFormPage />} />
          <Route path="/pets/:petId/records/:recordId" element={<RecordDetailPage />} />
          <Route path="/pets/:petId/records/:recordId/edit" element={<RecordFormPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
