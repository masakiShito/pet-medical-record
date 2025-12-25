const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T | null> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Types (v2)
export interface Pet {
  id: number;
  name: string;
  species?: string;
  sex?: string;
  birth_date?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Weight {
  id: number;
  pet_id: number;
  measured_on: string;
  weight_kg: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Medication {
  id: number;
  pet_id: number;
  name: string;
  dosage?: string;
  frequency?: string;
  start_on: string;
  end_on?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VetVisit {
  id: number;
  pet_id: number;
  visited_on: string;
  hospital_name?: string;
  doctor_name?: string;
  chief_complaint?: string;
  diagnosis?: string;
  cost_yen?: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Record {
  id: number;
  pet_id: number;
  recorded_on: string;
  condition?: string;
  note?: string;
  weights?: Weight[];
  medications?: Medication[];
  vet_visits?: VetVisit[];
  has_weights?: boolean;
  has_medications?: boolean;
  has_vet_visits?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PetSummary {
  pet_id: number;
  vet_visit_last?: {
    visit_id: number;
    visited_on: string;
    hospital_name?: string;
    diagnosis?: string;
    cost_yen?: number;
  };
  weight_last?: {
    weight_id: number;
    measured_on: string;
    weight_kg: number;
  };
  medication_active: {
    count: number;
    items: Array<{
      med_id: number;
      name: string;
      start_on: string;
      end_on?: string;
    }>;
  };
}

export interface ItemResponse<T> {
  item: T;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface HealthCheckResponse {
  status: string;
  db?: string;
  detail?: string;
}

// Health Check
export const healthCheck = (): Promise<HealthCheckResponse> => fetchAPI<HealthCheckResponse>('/health');
export const dbHealthCheck = (): Promise<HealthCheckResponse> => fetchAPI<HealthCheckResponse>('/db/health');

// Pets
export const getPets = (): Promise<ListResponse<Pet>> =>
  fetchAPI<ListResponse<Pet>>('/pets');

export const getPet = (petId: number): Promise<ItemResponse<Pet>> =>
  fetchAPI<ItemResponse<Pet>>(`/pets/${petId}`);

export const getPetSummary = (petId: number): Promise<ItemResponse<PetSummary>> =>
  fetchAPI<ItemResponse<PetSummary>>(`/pets/${petId}/summary`);

export const createPet = (petData: Partial<Pet>): Promise<ItemResponse<Pet>> =>
  fetchAPI<ItemResponse<Pet>>('/pets', {
    method: 'POST',
    body: JSON.stringify(petData),
  });

export const updatePet = (petId: number, petData: Partial<Pet>): Promise<ItemResponse<Pet>> =>
  fetchAPI<ItemResponse<Pet>>(`/pets/${petId}`, {
    method: 'PUT',
    body: JSON.stringify(petData),
  });

export const deletePet = (petId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}`, {
    method: 'DELETE',
  });

// Records
export const getRecords = (petId: number, params: { from_date?: string; to_date?: string; limit?: number; offset?: number } = {}): Promise<ListResponse<Record>> => {
  const queryParams = new URLSearchParams();
  if (params.from_date) queryParams.append('from_date', params.from_date);
  if (params.to_date) queryParams.append('to_date', params.to_date);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/pets/${petId}/records${queryString ? `?${queryString}` : ''}`;
  return fetchAPI<ListResponse<Record>>(endpoint);
};

export const getRecord = (petId: number, recordId: number): Promise<Record> =>
  fetchAPI<Record>(`/pets/${petId}/records/${recordId}`);

export const createRecord = (petId: number, recordData: Partial<Record>): Promise<{ id: number }> =>
  fetchAPI<{ id: number }>(`/pets/${petId}/records`, {
    method: 'POST',
    body: JSON.stringify(recordData),
  });

export const updateRecord = (petId: number, recordId: number, recordData: Partial<Record>): Promise<{ id: number }> =>
  fetchAPI<{ id: number }>(`/pets/${petId}/records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(recordData),
  });

export const deleteRecord = (petId: number, recordId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}/records/${recordId}`, {
    method: 'DELETE',
  });

// Vet Visits
export const getVetVisits = (petId: number, params: { from?: string; to?: string; q?: string; limit?: number; offset?: number } = {}): Promise<ListResponse<VetVisit>> => {
  const queryParams = new URLSearchParams();
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  if (params.q) queryParams.append('q', params.q);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/pets/${petId}/vet-visits${queryString ? `?${queryString}` : ''}`;
  return fetchAPI<ListResponse<VetVisit>>(endpoint);
};

export const getVetVisit = (petId: number, visitId: number): Promise<ItemResponse<VetVisit>> =>
  fetchAPI<ItemResponse<VetVisit>>(`/pets/${petId}/vet-visits/${visitId}`);

export const createVetVisit = (petId: number, visitData: Partial<VetVisit>): Promise<ItemResponse<VetVisit>> =>
  fetchAPI<ItemResponse<VetVisit>>(`/pets/${petId}/vet-visits`, {
    method: 'POST',
    body: JSON.stringify(visitData),
  });

export const updateVetVisit = (petId: number, visitId: number, visitData: Partial<VetVisit>): Promise<ItemResponse<VetVisit>> =>
  fetchAPI<ItemResponse<VetVisit>>(`/pets/${petId}/vet-visits/${visitId}`, {
    method: 'PUT',
    body: JSON.stringify(visitData),
  });

export const deleteVetVisit = (petId: number, visitId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}/vet-visits/${visitId}`, {
    method: 'DELETE',
  });

// Weights
export const getWeights = (petId: number, params: { from?: string; to?: string; limit?: number; offset?: number } = {}): Promise<ListResponse<Weight>> => {
  const queryParams = new URLSearchParams();
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/pets/${petId}/weights${queryString ? `?${queryString}` : ''}`;
  return fetchAPI<ListResponse<Weight>>(endpoint);
};

export const getWeight = (petId: number, weightId: number): Promise<ItemResponse<Weight>> =>
  fetchAPI<ItemResponse<Weight>>(`/pets/${petId}/weights/${weightId}`);

export const createWeight = (petId: number, weightData: Partial<Weight>): Promise<ItemResponse<Weight>> =>
  fetchAPI<ItemResponse<Weight>>(`/pets/${petId}/weights`, {
    method: 'POST',
    body: JSON.stringify(weightData),
  });

export const updateWeight = (petId: number, weightId: number, weightData: Partial<Weight>): Promise<ItemResponse<Weight>> =>
  fetchAPI<ItemResponse<Weight>>(`/pets/${petId}/weights/${weightId}`, {
    method: 'PUT',
    body: JSON.stringify(weightData),
  });

export const deleteWeight = (petId: number, weightId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}/weights/${weightId}`, {
    method: 'DELETE',
  });

// Medications
export const getMedications = (petId: number, params: { from?: string; to?: string; limit?: number; offset?: number } = {}): Promise<ListResponse<Medication>> => {
  const queryParams = new URLSearchParams();
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/pets/${petId}/medications${queryString ? `?${queryString}` : ''}`;
  return fetchAPI<ListResponse<Medication>>(endpoint);
};

export const getActiveMedications = (petId: number): Promise<ListResponse<Medication>> =>
  fetchAPI<ListResponse<Medication>>(`/pets/${petId}/medications/active`);

export const getMedication = (petId: number, medId: number): Promise<ItemResponse<Medication>> =>
  fetchAPI<ItemResponse<Medication>>(`/pets/${petId}/medications/${medId}`);

export const createMedication = (petId: number, medData: Partial<Medication>): Promise<ItemResponse<Medication>> =>
  fetchAPI<ItemResponse<Medication>>(`/pets/${petId}/medications`, {
    method: 'POST',
    body: JSON.stringify(medData),
  });

export const updateMedication = (petId: number, medId: number, medData: Partial<Medication>): Promise<ItemResponse<Medication>> =>
  fetchAPI<ItemResponse<Medication>>(`/pets/${petId}/medications/${medId}`, {
    method: 'PUT',
    body: JSON.stringify(medData),
  });

export const deleteMedication = (petId: number, medId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}/medications/${medId}`, {
    method: 'DELETE',
  });
