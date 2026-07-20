import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Categories from './pages/Categories';
import AdditionalServices from './pages/AdditionalServices';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Report from './pages/DailyReport';
import Expenses from './pages/Expenses';
import MonthlyReport from './pages/MonthlyReport';
import Dashboard from './pages/Dashboard';

function App() {
  const { admin, loading } = useAuth();

  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!admin) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;

      case 'categories':
        return <Categories />;

      case 'additional-services':
      case 'services':
        return <AdditionalServices />;

      case 'new-order':
        return <NewOrder />;

      case 'orders':
        return <Orders />;

      case 'daily-report':
        return <Report />;

      case 'expenses':
        return <Expenses />;

      case 'monthly-report':
        return <MonthlyReport />;

      default:
        return (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '12px',
            }}
          >
            <h2>{activePage.toUpperCase()} Page</h2>
            <p>Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;