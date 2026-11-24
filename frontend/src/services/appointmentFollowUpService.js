import axiosClient from '../api/axiosClient';

export const appointmentFollowUpService = {
  getFollowUps: async (appointmentId) => {
    const res = await axiosClient.get(`/appointments/${appointmentId}/follow-ups`);
    return res.data;
  },

  createFollowUp: async (appointmentId, followUpData) => {
    const res = await axiosClient.post(`/appointments/${appointmentId}/follow-ups`, followUpData);
    return res.data;
  },

  updateFollowUp: async (appointmentId, followUpId, followUpData) => {
    const res = await axiosClient.put(`/appointments/${appointmentId}/follow-ups/${followUpId}`, followUpData);
    return res.data;
  },

  updateStatus: async (appointmentId, followUpId, status, resolutionNotes = '') => {
    const res = await axiosClient.patch(`/appointments/${appointmentId}/follow-ups/${followUpId}/status`, {
      status,
      resolutionNotes
    });
    return res.data;
  },

  deleteFollowUp: async (appointmentId, followUpId) => {
    const res = await axiosClient.delete(`/appointments/${appointmentId}/follow-ups/${followUpId}`);
    return res.data;
  },

  getUpcomingReminders: async () => {
    const res = await axiosClient.get('/appointments/upcoming-reminders');
    return res.data;
  }
};

export default appointmentFollowUpService;
