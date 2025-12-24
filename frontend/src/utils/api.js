const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function fetchAPI(endpoint, options = {}) {
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

// Health Check
export const healthCheck = () => fetchAPI('/health');
export const dbHealthCheck = () => fetchAPI('/db/health');

// Pets
export const getPets = () => fetchAPI('/pets');

export const getPet = (petId) => fetchAPI(`/pets/${petId}`);

export const createPet = (petData) =>
  fetchAPI('/pets', {
    method: 'POST',
    body: JSON.stringify(petData),
  });

export const updatePet = (petId, petData) =>
  fetchAPI(`/pets/${petId}`, {
    method: 'PUT',
    body: JSON.stringify(petData),
  });

export const deletePet = (petId) =>
  fetchAPI(`/pets/${petId}`, {
    method: 'DELETE',
  });

// Records
export const getRecords = (petId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = `/pets/${petId}/records${queryString ? `?${queryString}` : ''}`;
  return fetchAPI(endpoint);
};

export const getRecord = (petId, recordId) =>
  fetchAPI(`/pets/${petId}/records/${recordId}`);

export const createRecord = (petId, recordData) =>
  fetchAPI(`/pets/${petId}/records`, {
    method: 'POST',
    body: JSON.stringify(recordData),
  });

export const updateRecord = (petId, recordId, recordData) =>
  fetchAPI(`/pets/${petId}/records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(recordData),
  });

export const deleteRecord = (petId, recordId) =>
  fetchAPI(`/pets/${petId}/records/${recordId}`, {
    method: 'DELETE',
  });
