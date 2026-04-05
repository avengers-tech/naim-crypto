import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AliceCarousel from "react-alice-carousel";
import { TrendingCoins } from "../config/api";
import { CryptoState } from "../CryptoContext";
import { numberWithCommas } from "./CoinTable";

const Carousel = () => {
  const [trending, setTrending] = useState([]);
  const { currency, symbol } = CryptoState();

  const fetchTrendingCoins = async () => {
    const { data } = await axios.get(TrendingCoins(currency));
    setTrending(data);
  };

  useEffect(() => {
    fetchTrendingCoins();
  }, [currency]);

  const items = trending.map((coin) => {
    let profit = coin?.price_change_percentage_24h >= 0;

    return (
      <Link className="carousel_item" to={`/coins/${coin.id}`}>
        <img
          className="coin_image"
          src={coin?.image}
          alt={coin.name}
          height={90}
        />
        <span className="coin_symbol">
          {coin?.symbol}
          &nbsp;
          <span
            className="profit_loss"
            style={{
              backgroundColor: profit > 0 ? "green" : "red",
            }}
          >
            {profit && "+"}
            {coin?.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </span>
        <span className="coin_price">
          {symbol} {numberWithCommas(coin?.current_price.toFixed(2))}
        </span>
      </Link>
    );
  });

  const responsive = {
    0: {
      items: 1,
    },
    576: {
      items: 2,
    },
    768: {
      items: 3,
    },
    992: {
      items: 4,
    },
    1200: {
      items: 5,
    },
  };

  return (
    <div className="carousel">
      <h3>Trending Cryptocurrencies</h3>

      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={1000}
        animationDuration={1500}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        items={items}
        autoPlay
      />
    </div>
  );
};

export default Carousel;
