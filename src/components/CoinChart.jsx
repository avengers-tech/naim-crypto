import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import { HistoricalChart } from "../config/api";
import { CryptoState } from "../CryptoContext";
import { chartDays } from "../config/data";

import "../styles/CoinPage.css";

const CoinChart = ({ coin }) => {
  const { currency, symbol } = CryptoState();
  const [days, setDays] = useState(1);
  const chartRef = useRef();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          HistoricalChart(coin.id, days, currency, symbol)
        );
        const data = response.data.prices.map((price) => ({
          x: new Date(price[0]),
          y: price[1],
        }));

        const labels = data.map((d) => {
          const options =
            days === 1
              ? { hour: "numeric", minute: "numeric", hour12: true }
              : { month: "short", day: "numeric", year: "numeric" };
          return d.x.toLocaleString("en-US", options);
        });

        setChartData({
          labels,
          datasets: [
            {
              label: `Price (${
                days === 1 ? "Past 24 Hours" : `Past ${days} days`
              }) in (${symbol}) ${currency}`,
              data,
              borderColor: "#EEBC1D",
              fill: false,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.log("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, [coin.id, days, currency, symbol]);

  useEffect(() => {
    if (chartRef.current && chartData) {
      const myChart = new Chart(chartRef.current, {
        type: "line",
        data: chartData,
        options: {
          scales: {
            yAxis: {
              ticks: {
                maxTicksLimit: 10,
              },
            },
            xAxis: {
              ticks: {
                maxTicksLimit: 15,
              },
            },
          },
          animation: {
            easing: "easeInOutQuad",
            duration: 1500,
          },
        },
      });

      return () => {
        myChart.destroy();
      };
    }
  }, [chartData]);

  const handleDaySelect = (selectedDay) => {
    setDays(selectedDay);
  };

  const chartDayButtonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#eee",
    cursor: "pointer",
  };

  const selectedChartDayButtonStyle = {
    ...chartDayButtonStyle,
    backgroundColor: "#ccc",
  };

  if (loading) {
    return (
      <div className="loader_bg">
        <span className="loader" />
      </div>
    );
  }

  return (
    <div className="coin_chart">
      <canvas ref={chartRef}></canvas>
      <div className="duartion_btns">
        {chartDays.map((day) => (
          <button
            key={day.value}
            onClick={() => handleDaySelect(day.value)}
            style={
              day.value === days
                ? selectedChartDayButtonStyle
                : chartDayButtonStyle
            }
          >
            {day.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CoinChart;
