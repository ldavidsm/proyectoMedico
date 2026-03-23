const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const profileService = {
  async updateProfessionalProfile(profileData: unknown) {
    const response = await fetch(`${API_URL}/auth/complete-profile`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al actualizar el perfil');
    }

    return response.json();
  },

  async getMyProfile() {
    const response = await fetch(`${API_URL}/profile/me`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Error al obtener perfil');
    return response.json();
  },
};
