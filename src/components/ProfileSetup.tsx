import React, { useState, useEffect } from 'react';
import { User, Plus, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const [skillsOffered, setSkillsOffered] = useState(user?.skillsOffered || []);
  const [skillsLearning, setSkillsLearning] = useState(user?.skillsLearning || []);
  const [newSkillOffered, setNewSkillOffered] = useState({ name: '', description: '' });
  const [newSkillLearning, setNewSkillLearning] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const addSkillOffered = () => {
    if (newSkillOffered.name.trim()) {
      setSkillsOffered([...skillsOffered, { ...newSkillOffered, sessionsCompleted: 0 }]);
      setNewSkillOffered({ name: '', description: '' });
    }
  };

  const addSkillLearning = () => {
    if (newSkillLearning.name.trim()) {
      setSkillsLearning([...skillsLearning, { ...newSkillLearning, sessionsCompleted: 0 }]);
      setNewSkillLearning({ name: '', description: '' });
    }
  };

  const removeSkillOffered = (index: number) => {
    setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
  };

  const removeSkillLearning = (index: number) => {
    setSkillsLearning(skillsLearning.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.put('http://localhost:5000/api/users/profile', {
        skillsOffered,
        skillsLearning
      });
      
      updateUser({
        skillsOffered,
        skillsLearning
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <User className="h-6 w-6 mr-2 text-purple-600" />
          Profile Setup
        </h2>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Skills I Offer */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills I Offer</h3>
          
          <div className="space-y-4 mb-4">
            {skillsOffered.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-purple-700">{skill.name}</div>
                  <div className="text-sm text-gray-600">{skill.description}</div>
                </div>
                <button
                  onClick={() => removeSkillOffered(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Skill name (e.g., JavaScript, Guitar)"
              value={newSkillOffered.name}
              onChange={(e) => setNewSkillOffered({ ...newSkillOffered, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Description"
              value={newSkillOffered.description}
              onChange={(e) => setNewSkillOffered({ ...newSkillOffered, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={addSkillOffered}
            className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skill I Offer</span>
          </button>
        </div>

        {/* Skills I Want to Learn */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills I Want to Learn</h3>
          
          <div className="space-y-4 mb-4">
            {skillsLearning.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-700">{skill.name}</div>
                  <div className="text-sm text-gray-600">{skill.description}</div>
                </div>
                <button
                  onClick={() => removeSkillLearning(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Skill name (e.g., SQL, Photography)"
              value={newSkillLearning.name}
              onChange={(e) => setNewSkillLearning({ ...newSkillLearning, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="What you want to learn"
              value={newSkillLearning.description}
              onChange={(e) => setNewSkillLearning({ ...newSkillLearning, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={addSkillLearning}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skill I Want to Learn</span>
          </button>
        </div>

        <button
          onClick={saveProfile}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{loading ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>
    </div>
  );
}