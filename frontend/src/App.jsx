import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Categories from './pages/Categories';
import AdditionalServices from './pages/AdditionalServices';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';

function App() {
  const { admin, loading } = useAuth();
  const [activePage, setActivePage] = useState('categories');

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!admin) {
    return <Login />;
  }

  // Render logic based on activePage
  const renderContent = () => {
    switch (activePage) {
      case 'categories':
        return <Categories />;
      case 'additional-services':
      case 'services': // In case the Sidebar passes 'services' as the key
        return <AdditionalServices />;
      case 'new-order':
        return <NewOrder />;
      case 'orders':
        return <Orders />;
      default:
        return (
          <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px' }}>
            <h2>{activePage.toUpperCase()} Page</h2>
            <p>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderContent()}
    </Layout>
  );
}

export default App;