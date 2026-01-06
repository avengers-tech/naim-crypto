import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CoinPage from './pages/CoinPage';
import { CryptoState } from './CryptoContext';

function App() {
  const { theme } = CryptoState();

  return (
    <div className={`App ${theme}`}>
      <BrowserRouter>
        <div>
          <Header />
          <Routes>
            <Route path='/' element={<HomePage />} exact />
            <Route path='/coins/:id' element={<CoinPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
