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

// Types
export interface Pet {
  id: number;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  sex?: 'male' | 'female' | 'unknown';
  birthday?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Weight {
  id?: number;
  weight_kg: number;
  measured_at?: string;
  note?: string;
}

export interface Medication {
  id?: number;
  name: string;
  dosage?: string;
  frequency?: string;
  started_on?: string;
  ended_on?: string;
  note?: string;
}

export interface VetVisit {
  id?: number;
  hospital_name?: string;
  doctor?: string;
  reason?: string;
  diagnosis?: string;
  cost_yen?: number;
  note?: string;
}

export interface Record {
  id: number;
  pet_id: number;
  recorded_on: string;
  title?: string;
  condition_level?: number;
  appetite_level?: number;
  stool_level?: number;
  memo?: string;
  weights?: Weight[];
  medications?: Medication[];
  vet_visits?: VetVisit[];
  has_weights?: boolean;
  has_medications?: boolean;
  has_vet_visits?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PetsResponse {
  items: Pet[];
  total?: number;
}

export interface RecordsResponse {
  items: Record[];
  total?: number;
}

export interface HealthCheckResponse {
  status: string;
  message: string;
}

export interface RecordParams {
  record_type?: string;
  start_date?: string;
  end_date?: string;
}

// Health Check
export const healthCheck = (): Promise<HealthCheckResponse> => fetchAPI<HealthCheckResponse>('/health');
export const dbHealthCheck = (): Promise<HealthCheckResponse> => fetchAPI<HealthCheckResponse>('/db/health');

// Pets
export const getPets = (): Promise<PetsResponse> => fetchAPI<PetsResponse>('/pets');

export const getPet = (petId: number): Promise<Pet> => fetchAPI<Pet>(`/pets/${petId}`);

export const createPet = (petData: Partial<Pet>): Promise<Pet> =>
  fetchAPI<Pet>('/pets', {
    method: 'POST',
    body: JSON.stringify(petData),
  });

export const updatePet = (petId: number, petData: Partial<Pet>): Promise<Pet> =>
  fetchAPI<Pet>(`/pets/${petId}`, {
    method: 'PUT',
    body: JSON.stringify(petData),
  });

export const deletePet = (petId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}`, {
    method: 'DELETE',
  });

// Records
export const getRecords = (petId: number, params: RecordParams = {}): Promise<RecordsResponse> => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const endpoint = `/pets/${petId}/records${queryString ? `?${queryString}` : ''}`;
  return fetchAPI<RecordsResponse>(endpoint);
};

export const getRecord = (petId: number, recordId: number): Promise<Record> =>
  fetchAPI<Record>(`/pets/${petId}/records/${recordId}`);

export const createRecord = (petId: number, recordData: Partial<Record>): Promise<Record> =>
  fetchAPI<Record>(`/pets/${petId}/records`, {
    method: 'POST',
    body: JSON.stringify(recordData),
  });

export const updateRecord = (petId: number, recordId: number, recordData: Partial<Record>): Promise<Record> =>
  fetchAPI<Record>(`/pets/${petId}/records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(recordData),
  });

export const deleteRecord = (petId: number, recordId: number): Promise<null> =>
  fetchAPI<null>(`/pets/${petId}/records/${recordId}`, {
    method: 'DELETE',
  });
