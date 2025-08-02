import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

interface Provider {
  _id: string;
  name: string;
  email: string;
  skillsOffered: Array<{ name: string; description: string }>;
  rating: number;
}

interface CreateSessionProps {
  onSessionCreated: () => void;
}

export default function CreateSession({ onSessionCreated }: CreateSessionProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [formData, setFormData] = useState({
    skillName: '',
    description: '',
    dateTime: '',
    duration: 1,
    providerId: '',
    meetLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users/providers');
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/sessions/create', formData);
      setSuccess('Session created successfully!');
      setFormData({
        skillName: '',
        description: '',
        dateTime: '',
        duration: 1,
        providerId: '',
        meetLink: ''
      });
      onSessionCreated();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create session');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="h-6 w-6 mr-2 text-purple-600" />
        Create New Session
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name
            </label>
            <input
              type="text"
              name="skillName"
              value={formData.skillName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., JavaScript, Graphic Design, Guitar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider
            </label>
            <select
              name="providerId"
              value={formData.providerId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  {provider.name} ({provider.rating}⭐)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Describe what you want to learn or what help you need"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={formData.dateTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="0.5"
              max="8"
              step="0.5"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <LinkIcon className="inline h-4 w-4 mr-1" />
            Google Meet Link (Optional)
          </label>
          <input
            type="url"
            name="meetLink"
            value={formData.meetLink}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://meet.google.com/..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Session...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
}