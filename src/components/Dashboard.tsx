import React, { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, Users, Star, LogOut, MessageCircle, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreateSession from './CreateSession';
import SessionsList from './SessionsList';
import SkillMatching from './SkillMatching';
import ChatList from './ChatList';
import ProfileSetup from './ProfileSetup';
import axios from 'axios';

interface Session {
  _id: string;
  skillName: string;
  description: string;
  dateTime: string;
  duration: number;
  requesterId: { _id: string; name: string; email: string };
  providerId: { _id: string; name: string; email: string };
  meetLink: string;
  status: string;
}

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCreateSession, setShowCreateSession] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sessions/my');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const upcomingSessions = sessions.filter(s => 
    new Date(s.dateTime) > new Date() && s.status !== 'cancelled'
  );

  const recentActivity = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TimeBank
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Calendar },
            { id: 'sessions', label: 'My Sessions', icon: Users },
            { id: 'create', label: 'Create Session', icon: Plus },
            { id: 'matching', label: 'Find Skills', icon: Search },
            { id: 'chat', label: 'Messages', icon: MessageCircle },
            { id: 'profile', label: 'Profile', icon: Star }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Time Wallet */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-purple-600" />
                Your Time Wallet
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {user?.totalEarned || 0}h
                  </div>
                  <div className="text-green-600 font-medium">Earned</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {user?.totalSpent || 0}h
                  </div>
                  <div className="text-blue-600 font-medium">Spent</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {user?.timeBalance || 0}h
                  </div>
                  <div className="text-purple-600 font-medium">Balance</div>
                </div>
              </div>
            </div>

            {/* Skills Offered */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Skills Offered</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {user?.skillsOffered?.length ? (
                  user.skillsOffered.map((skill, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="font-semibold text-purple-700">{skill.name}</div>
                      <div className="text-sm text-gray-600">{skill.sessionsCompleted} sessions completed</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No skills added yet. Click "Create Session" to start offering your skills!</p>
                )}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Upcoming Sessions</h3>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div key={session._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{session.skillName}</h4>
                          <p className="text-sm text-gray-600">
                            {session.providerId._id === user?.id ? 'Teaching' : 'Learning from'}{' '}
                            {session.providerId._id === user?.id ? session.requesterId.name : session.providerId.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.dateTime).toLocaleDateString()} at{' '}
                            {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-purple-600">{session.duration}h</div>
                          {session.meetLink && (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No upcoming sessions. Create one to get started!</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((session) => (
                    <div key={session._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">
                          {session.providerId._id === user?.id ? 'Taught' : 'Learned'} {session.skillName}
                        </span>
                        <span className="text-gray-500 ml-2">
                          {session.providerId._id === user?.id ? 'to' : 'from'}{' '}
                          {session.providerId._id === user?.id ? session.requesterId.name : session.providerId.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.dateTime).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No activity yet. Start your first session!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <SessionsList sessions={sessions} currentUserId={user?.id} onRefresh={fetchSessions} />
        )}

        {activeTab === 'create' && (
          <CreateSession onSessionCreated={fetchSessions} />
        )}

        {activeTab === 'matching' && (
          <SkillMatching />
        )}

        {activeTab === 'chat' && (
          <ChatList />
        )}

        {activeTab === 'profile' && (
          <ProfileSetup />
        )}
      </div>
    </div>
  );
}