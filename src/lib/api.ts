const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  // User endpoints
  async createUser(email: string, name: string) {
    const response = await fetch(`${API_URL}/users/?email=${email}&name=${name}`, {
      method: 'POST',
    });
    return response.json();
  },

  async getUser(userId: string) {
    const response = await fetch(`${API_URL}/users/${userId}`);
    return response.json();
  },

  // Exercise endpoints
  async getExercises() {
    const response = await fetch(`${API_URL}/exercises/`);
    return response.json();
  },

  async getExercise(exerciseId: string) {
    const response = await fetch(`${API_URL}/exercises/${exerciseId}`);
    return response.json();
  },

  // Progress endpoints
  async createProgress(userId: string, imageUrl: string, notes: string) {
    const response = await fetch(`${API_URL}/progress/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, image_url: imageUrl, notes }),
    });
    return response.json();
  },

  async getUserProgress(userId: string) {
    const response = await fetch(`${API_URL}/progress/${userId}`);
    return response.json();
  },

  // Routine endpoints
  async createRoutine(userId: string, exerciseIds: string[]) {
    const response = await fetch(`${API_URL}/routines/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, exercise_ids: exerciseIds }),
    });
    return response.json();
  },

  async getUserRoutines(userId: string) {
    const response = await fetch(`${API_URL}/routines/${userId}`);
    return response.json();
  },

  async completeRoutine(routineId: string) {
    const response = await fetch(`${API_URL}/routines/${routineId}/complete`, {
      method: 'PUT',
    });
    return response.json();
  },

  // AI Coaching endpoint
  async chatWithAI(userId: string, message: string) {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, message }),
    });
    return response.json();
  },
};