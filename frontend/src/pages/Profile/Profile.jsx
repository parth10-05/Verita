import React, { useContext } from 'react';
import { useAuth } from '../../context/AuthContext';

const mockQuestions = [
  {
    id: '1',
    title: 'How to implement authentication in React with JWT?',
    createdAt: '2024-01-15T10:30:00Z',
    votes: 15,
    answers: 3,
    isAccepted: false
  },
  {
    id: '2',
    title: 'Best practices for state management in large React applications',
    createdAt: '2024-01-14T15:45:00Z',
    votes: 28,
    answers: 7,
    isAccepted: true
  }
];

const Profile = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="main-content text-center" style={{ marginTop: '3rem' }}>
        <div className="card" style={{ padding: '2rem', maxWidth: 400, margin: '0 auto' }}>
          <h2>Please log in to view your profile.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=667eea&color=fff&size=64`}
            alt={user.name}
            style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--primary-color)' }}
          />
          <div>
            <h2 style={{ marginBottom: 4 }}>{user.name}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user.email}</div>
          </div>
        </div>
        <button className="btn btn-outline mb-4" onClick={logout}>Logout</button>
        <h3 className="mb-2">Your Questions</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {mockQuestions.map(q => (
            <li key={q.id} className="card mb-3" style={{ padding: '1rem', borderLeft: q.isAccepted ? '4px solid var(--success-color)' : '4px solid var(--primary-color)' }}>
              <div style={{ fontWeight: 600 }}>{q.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {q.votes} votes • {q.answers} answers • {new Date(q.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
