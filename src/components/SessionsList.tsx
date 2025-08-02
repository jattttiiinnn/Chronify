import React from 'react';
import { Calendar, Clock, Users, Link as LinkIcon, CheckCircle } from 'lucide-react';
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

interface SessionsListProps {
  sessions: Session[];
  currentUserId?: string;
  onRefresh: () => void;
}

export default function SessionsList({ sessions, currentUserId, onRefresh }: SessionsListProps) {
  const handleCompleteSession = async (sessionId: string) => {
    try {
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/complete`);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to complete session');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingSessions = sessions.filter(s => 
    new Date(s.dateTime) > new Date() && s.status !== 'cancelled'
  );

  const pastSessions = sessions.filter(s => 
    new Date(s.dateTime) <= new Date() || s.status === 'completed' || s.status === 'cancelled'
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Sessions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-purple-600" />
          Upcoming Sessions ({upcomingSessions.length})
        </h2>

        {upcomingSessions.length > 0 ? (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{session.skillName}</h3>
                    <p className="text-gray-600 mt-1">{session.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(session.dateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(session.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                      ({session.duration}h)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.providerId._id === currentUserId ? 'Teaching' : 'Learning from'}{' '}
                      {session.providerId._id === currentUserId ? session.requesterId.name : session.providerId.name}
                    </span>
                  </div>
                  {session.meetLink && (
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-4 w-4 text-blue-600" />
                      <a
                        href={session.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>

                {session.providerId._id === currentUserId && session.status === 'confirmed' && (
                  <button
                    onClick={() => handleCompleteSession(session._id)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark as Complete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No upcoming sessions. Create a new session to get started!</p>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="h-6 w-6 mr-2 text-purple-600" />
          Past Sessions ({pastSessions.length})
        </h2>

        {pastSessions.length > 0 ? (
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <div key={session._id} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{session.skillName}</h3>
                    <p className="text-gray-600 text-sm mt-1">{session.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(session.dateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{session.duration}h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>
                      {session.providerId._id === currentUserId ? session.requesterId.name : session.providerId.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No past sessions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}