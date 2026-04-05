import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CoinPage from './pages/CoinPage';
import PortfolioPage from './pages/PortfolioPage';
import DisclaimerBanner from './components/DisclaimerBanner';
import CryptoContext from './CryptoContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <CryptoContext>
      <AuthProvider>
        <BrowserRouter>
          <div>
            <DisclaimerBanner />
            <Header />
            <Routes>
              <Route path='/' element={<HomePage />} exact />
              <Route path='/coins/:id' element={<CoinPage />} />
              <Route path='/portfolio' element={<PortfolioPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </CryptoContext>
  );
}

export default App;
