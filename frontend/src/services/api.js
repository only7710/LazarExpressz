import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Get all trains with optional filters
  async getTrains(filters = {}) {
    try {
      const response = await this.client.get('/trains', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching trains:', error);
      throw error;
    }
  }

  // Get specific train details
  async getTrainDetails(trainId) {
    try {
      const response = await this.client.get(`/trains/${trainId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching train details:', error);
      throw error;
    }
  }

  // Get train position
  async getTrainPosition(trainId) {
    try {
      const response = await this.client.get(`/trains/${trainId}/position`);
      return response.data;
    } catch (error) {
      console.error('Error fetching train position:', error);
      throw error;
    }
  }

  // Get all stations
  async getStations() {
    try {
      const response = await this.client.get('/stations');
      return response.data;
    } catch (error) {
      console.error('Error fetching stations:', error);
      throw error;
    }
  }

  // Search trains
  async searchTrains(query) {
    try {
      const response = await this.client.get('/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching trains:', error);
      throw error;
    }
  }

  // Get system status
  async getSystemStatus() {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }
}

export default new ApiService();