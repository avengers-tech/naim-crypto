import React from "react";
import Carousel from "./Carousel";

const Banner = () => {
  return (
    <>
      <div className="banner">
        <h1 className="headline">Crypto Hub</h1>
        <p className="tagline">
          Get all the Info regarding your favorite Crypto Currency
        </p>
      </div>
      <Carousel />
    </>
  );
};

export default Banner;
