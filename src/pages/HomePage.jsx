import React from "react";
import Banner from "../components/Banner";
import CoinTable from "../components/CoinTable";
import TrendingCoins from "../components/TrendingCoins";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div>
      <Banner />
      <TrendingCoins />
      <CoinTable />
      <Footer />
    </div>
  );
};

export default HomePage;
