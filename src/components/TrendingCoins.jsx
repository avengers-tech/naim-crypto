import React, { useEffect, useState } from "react";
import axios from "axios";
import { TrendingCoins as TrendingCoinsAPI } from "../config/api";
import { useNavigate } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { numberWithCommas } from "./CoinTable";
import "../styles/TrendingCoins.css";

const TrendingCoins = () => {
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency, symbol } = CryptoState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        const { data } = await axios.get(TrendingCoinsAPI(currency));
        setTrendingCoins(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
        setLoading(false);
      }
    };

    fetchTrendingCoins();
  }, [currency]);

  if (loading) {
    return (
      <div className="trending_container">
        <h3 className="trending_title">Trending Cryptocurrencies</h3>
        <div className="loader_bg">
          <span className="loader" />
        </div>
      </div>
    );
  }

  return (
    <div className="trending_container">
      <h3 className="trending_title">Trending Cryptocurrencies</h3>
      <div className="trending_grid">
        {trendingCoins.slice(0, 10).map((coin) => {
          const profit = coin.price_change_percentage_24h > 0;
          return (
            <div
              key={coin.id}
              className="trending_coin_card"
              onClick={() => navigate(`/coins/${coin.id}`)}
            >
              <img src={coin.image} alt={coin.name} height="40" />
              <div className="trending_coin_info">
                <span className="trending_coin_symbol">{coin.symbol.toUpperCase()}</span>
                <span className="trending_coin_name">{coin.name}</span>
                <span
                  className="trending_coin_change"
                  style={{ color: profit ? "green" : "red" }}
                >
                  {profit && "+"}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
                <span className="trending_coin_price">
                  {symbol} {numberWithCommas(coin.current_price?.toFixed(2))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingCoins;
