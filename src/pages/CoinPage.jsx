import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import CoinChart from "../components/CoinChart";
import PredictionPanel from "../components/PredictionPanel";
import { SingleCoin } from "../config/api";
import { numberWithCommas } from "../components/CoinTable";
import { CryptoState } from "../CryptoContext";

import '../styles/CoinPage.css'

const CoinPage = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState();

  const { currency, symbol } = CryptoState();

  const fetchCoin = async () => {
    const { data } = await axios.get(SingleCoin(id));

    setCoin(data);
  };

  useEffect(() => {
    fetchCoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (!coin) return <div style={{ backgroundColor: "gold" }} />;

  return (
    <div className="coinpage">
      <div className="sidebar">
        <img
          src={coin?.image.large}
          alt={coin?.name}
          height="150"
          className="chart_coin_image"
        />
        <h4 className="chart_coin_name">{coin?.name}</h4>
        <div className="coin_description">
          {parse(coin?.description.en.split(". ")[0])}.
        </div>
        <div className="coin_marketdata">
          <span className="secondary_head">
            <span className="sh_bold">Rank :</span>
            &nbsp; &nbsp;
            <span className="sh_regular">
              {numberWithCommas(coin?.market_cap_rank)}
            </span>
          </span>
          <span className="secondary_head">
            <span className="sh_bold">Current Price :</span>
            &nbsp; &nbsp;
            <span className="sh_regular">
              {symbol}{" "}
              {numberWithCommas(
                coin?.market_data.current_price[currency.toLowerCase()]
              )}
            </span>
          </span>
          <span className="secondary_head">
            <span className="sh_bold">Market Cap :</span>
            &nbsp; &nbsp;
            <span className="sh_regular">
              {symbol}{" "}
              {numberWithCommas(
                coin?.market_data.market_cap[currency.toLowerCase()]
                  .toString()
                  .slice(0, -6)
              )}
              M
            </span>
          </span>
        </div>
        <PredictionPanel coin={coin} />
      </div>
      <CoinChart coin={coin} />
    </div>
  );
};

export default CoinPage;