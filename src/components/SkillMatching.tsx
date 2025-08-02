import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Star, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface MatchedUser {
  _id: string;
  name: string;
  email: string;
  skillsOffered: Array<{ name: string; description: string; sessionsCompleted: number }>;
  rating: number;
  reviewsCount: number;
}

export default function SkillMatching() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async (skill?: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/users/providers${skill ? `?skill=${skill}` : ''}`);
      setMatchedUsers(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMatches(searchTerm);
  };

  const startChat = async (userId: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/chat/create', {
        participantId: userId
      });
      // You could navigate to chat here or show a success message
      alert('Chat started! Check your Messages tab.');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const getSkillMatches = (userSkills: any[]) => {
    if (!user?.skillsLearning) return [];
    
    return userSkills.filter(skill => 
      user.skillsLearning.some(learning => 
        learning.name.toLowerCase().includes(skill.name.toLowerCase()) ||
        skill.name.toLowerCase().includes(learning.name.toLowerCase())
      )
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Search className="h-6 w-6 mr-2 text-purple-600" />
          Find Skill Partners
        </h2>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for skills (e.g., SQL, JavaScript, Guitar)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Skill Suggestions */}
        {user?.skillsLearning && user.skillsLearning.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills You Want to Learn</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsLearning.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(skill.name);
                    fetchMatches(skill.name);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full hover:from-green-200 hover:to-emerald-200 transition-colors"
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Finding matches...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedUsers.map((matchedUser) => {
              const skillMatches = getSkillMatches(matchedUser.skillsOffered);
              
              return (
                <div key={matchedUser._id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{matchedUser.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{matchedUser.rating.toFixed(1)}</span>
                        <span>({matchedUser.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Offered */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h4>
                    <div className="space-y-2">
                      {matchedUser.skillsOffered.map((skill, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded-lg text-sm ${
                            skillMatches.some(match => match.name === skill.name)
                              ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-xs opacity-75">{skill.sessionsCompleted} sessions completed</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skill Matches Highlight */}
                  {skillMatches.length > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700 mb-1">
                        🎯 Perfect Match!
                      </div>
                      <div className="text-xs text-green-600">
                        They can teach: {skillMatches.map(s => s.name).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startChat(matchedUser._id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => startChat(matchedUser._id)}
                      className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && matchedUsers.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No matches found. Try searching for different skills or set up your profile first.</p>
          </div>
        )}
      </div>
    </div>
  );
}