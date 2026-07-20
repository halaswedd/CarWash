import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

function App() {
  const { admin, loading, logout } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  // Iza ma fi Admin logged-in, e'red safhat l-Login
  if (!admin) {
    return <Login />;
  }

  // Iza logged-in, e'red l-Dashboard (la-hne'meleh ba'den)
  return (
    <div style={{ padding: '20px' }}>
      <h1>Car Wash Admin Dashboard</h1>
      <p>Welcome, {admin.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default App;