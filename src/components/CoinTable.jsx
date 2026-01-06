import React, { useEffect, useState } from "react";
import axios from "axios";
import { CoinList } from "../config/api";
import { useNavigate } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import "../styles/CoinTable.css";

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function CoinsTable() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { currency, symbol } = CryptoState();

  const fetchCoins = async () => {
    setLoading(true);
    const { data } = await axios.get(CoinList(currency));
    setCoins(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const handleSearch = () => {
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search) ||
        coin.symbol.toLowerCase().includes(search)
    );
  };
  
  console.log(search);

  const navigate = useNavigate();

  return (
    <div className="container">
      <h3 className="title">Cryptocurrency Prices by Market Cap</h3>
      <input
        type="text"
        className="search_coin"
        placeholder="Search For a Crypto Currency"
        value={search.toLocaleUpperCase()}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />
      {loading ? (
        <span className="loader"/>
      ) : (
        <table className="coin_table">
          <thead>
            <tr className="table_head">
              <th>Coin</th>
              <th>Price</th>
              <th>24h Change</th>
              <th>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {handleSearch()
              .slice((page - 1) * 10, (page - 1) * 10 + 10)
              .map((row) => {
                const profit = row.price_change_percentage_24h > 0;
                return (
                  <tr
                    onClick={() => navigate(`/coins/${row.id}`)}
                    className="coin_row"
                    key={row.name}
                  >
                    <td className="coin_cell">
                      <img src={row?.image} alt={row.name} height="50" />
                      <div className="coin_details">
                        <span className="coin_symbol">{row.symbol}</span>
                        <span className="coin_name">{row.name}</span>
                      </div>
                    </td>
                    <td className="right_pad">
                      {symbol} {numberWithCommas(row.current_price.toFixed(2))}
                    </td>
                    <td
                      className="right_pad"
                      style={{
                        color: profit > 0 ? "green" : "red",
                      }}
                    >
                      {profit && "+"}
                      {row.price_change_percentage_24h.toFixed(2)}%
                    </td>
                    <td className="right_pad">
                      {symbol}{" "}
                      {numberWithCommas(row.market_cap.toString().slice(0, -6))}
                      M
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
      <div className="pagination">
        {Array.from({
          length: Math.ceil(handleSearch().length / 10),
        }).map((_, index) => (
          <button
            key={index}
            className={`page ${page === index + 1 ? "active" : ""}`}
            onClick={() => {
              setPage(index + 1);
              window.scroll(0, 450);
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
