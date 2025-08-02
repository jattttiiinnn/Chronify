import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get session by ID
export const getSession = async (sessionId: string) => {
  const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
  return response.data;
};

// Start a session
interface StartSessionParams {
  sessionId: string;
  roomId: string;
}

export const startSession = async ({ sessionId, roomId }: StartSessionParams) => {
  const response = await axios.post(
    `${API_URL}/sessions/${sessionId}/start`,
    { roomId },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

// End a session
export const endSession = async (sessionId: string) => {
  const response = await axios.post(
    `${API_URL}/sessions/${sessionId}/end`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

// Get user's sessions
export const getUserSessions = async (status?: string) => {
  const url = status 
    ? `${API_URL}/sessions/my-sessions?status=${status}`
    : `${API_URL}/sessions/my-sessions`;
    
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

// Create a new session
export const createSession = async (sessionData: any) => {
  const response = await axios.post(
    `${API_URL}/sessions`,
    sessionData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

// Update a session
export const updateSession = async (sessionId: string, updates: any) => {
  const response = await axios.put(
    `${API_URL}/sessions/${sessionId}`,
    updates,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

// Cancel a session
export const cancelSession = async (sessionId: string, reason?: string) => {
  const response = await axios.post(
    `${API_URL}/sessions/${sessionId}/cancel`,
    { reason },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

// Get session messages
export const getSessionMessages = async (sessionId: string) => {
  const response = await axios.get(
    `${API_URL}/sessions/${sessionId}/messages`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};

// Send a message in a session
export const sendMessage = async (sessionId: string, content: string) => {
  const response = await axios.post(
    `${API_URL}/sessions/${sessionId}/messages`,
    { content },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return response.data;
};
