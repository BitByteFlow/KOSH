import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Toaster } from 'sonner';
import CheckoutPage from './pages/CheckoutPage';
import TransactionsPage from './pages/TransactionsPage';

// Placeholder Pages
const SettingsPage = () => <div className="p-6">Settings UI coming soon...</div>;

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" expand={true} richColors closeButton />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<CheckoutPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
