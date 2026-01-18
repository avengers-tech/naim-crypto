import React, { useEffect, useState } from "react";
import axios from "axios";
import * as tf from "@tensorflow/tfjs";
import { HistoricalChart } from "../config/api";
import { CryptoState } from "../CryptoContext";
import "../styles/PredictionPanel.css";

const PredictionPanel = ({ coin }) => {
  const { currency, symbol } = CryptoState();
  const [historicalData, setHistoricalData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const { data } = await axios.get(HistoricalChart(coin.id, 30, currency));
        setHistoricalData(data.prices);
        await analyzeData(data.prices);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setLoading(false);
      }
    };

    if (coin) {
      fetchHistoricalData();
    }
  }, [coin, currency]);

  const analyzeData = async (prices) => {
    if (!prices || prices.length < 10) return; // Need at least 10 data points for ML

    // Get last 24 hours data (assuming hourly data)
    const recentPrices = prices.slice(-24);
    const olderPrices = prices.slice(-48, -24);

    if (recentPrices.length === 0 || olderPrices.length === 0) return;

    const recentAvg = recentPrices.reduce((sum, p) => sum + p[1], 0) / recentPrices.length;
    const olderAvg = olderPrices.reduce((sum, p) => sum + p[1], 0) / olderPrices.length;

    const priceChange24h = ((recentAvg - olderAvg) / olderAvg) * 100;

    // Simple moving average analysis
    const shortMA = prices.slice(-7).reduce((sum, p) => sum + p[1], 0) / 7;
    const longMA = prices.slice(-30).reduce((sum, p) => sum + p[1], 0) / 30;

    const maSignal = shortMA > longMA ? "bullish" : "bearish";

    // Volume analysis (simplified - using price volatility as proxy)
    const volatility = Math.abs(priceChange24h);

    // ML Prediction using Linear Regression
    const priceValues = prices.map(p => p[1]);
    const inputs = [];
    const outputs = [];

    // Prepare training data: use last 5 prices to predict next price
    for (let i = 0; i < priceValues.length - 6; i++) {
      inputs.push(priceValues.slice(i, i + 5));
      outputs.push(priceValues[i + 5]);
    }

    if (inputs.length < 5) return; // Not enough data for training

    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs, [outputs.length, 1]);

    // Create and train linear regression model
    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [5], units: 1 }));

    model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

    await model.fit(inputTensor, outputTensor, { epochs: 100, verbose: 0 });

    // Predict next price
    const lastPrices = priceValues.slice(-5);
    const predictionInput = tf.tensor2d([lastPrices]);
    const prediction = model.predict(predictionInput);
    const predictedPrice = prediction.dataSync()[0];

    const currentPrice = priceValues[priceValues.length - 1];
    const mlPredictionChange = ((predictedPrice - currentPrice) / currentPrice) * 100;

    // Clean up tensors
    inputTensor.dispose();
    outputTensor.dispose();
    predictionInput.dispose();
    prediction.dispose();

    let recommendation = "Hold";
    let confidence = "Low";
    let reasoning = [];

    // Incorporate ML prediction into recommendation
    if (mlPredictionChange > 2) {
      recommendation = "Buy";
      confidence = "Medium";
      reasoning.push(`ML predicts ${mlPredictionChange.toFixed(2)}% price increase`);
    } else if (mlPredictionChange < -2) {
      recommendation = "Sell";
      confidence = "Medium";
      reasoning.push(`ML predicts ${mlPredictionChange.toFixed(2)}% price decrease`);
    }

    if (priceChange24h > 5) {
      recommendation = "Buy";
      confidence = "Medium";
      reasoning.push("Strong 24h price increase");
    } else if (priceChange24h < -5) {
      recommendation = "Sell";
      confidence = "Medium";
      reasoning.push("Significant 24h price drop");
    }

    if (maSignal === "bullish" && recommendation !== "Sell") {
      recommendation = "Buy";
      reasoning.push("Short-term MA above long-term MA");
    } else if (maSignal === "bearish" && recommendation !== "Buy") {
      recommendation = "Sell";
      reasoning.push("Short-term MA below long-term MA");
    }

    if (volatility > 10) {
      reasoning.push("High volatility - potential growth opportunity");
      if (recommendation === "Buy") confidence = "High";
    }

    setPrediction({
      recommendation,
      confidence,
      priceChange24h: priceChange24h.toFixed(2),
      mlPrediction: mlPredictionChange.toFixed(2),
      reasoning,
      maSignal,
      volatility: volatility.toFixed(2)
    });
  };

  if (loading) {
    return (
      <div className="prediction_panel">
        <h4 className="prediction_title">AI Prediction Analysis</h4>
        <div className="loader_bg">
          <span className="loader" />
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="prediction_panel">
        <h4 className="prediction_title">AI Prediction Analysis</h4>
        <p>Unable to generate prediction at this time.</p>
      </div>
    );
  }

  return (
    <div className="prediction_panel">
      <h4 className="prediction_title">AI Prediction Analysis</h4>
      <div className="prediction_content">
        <div className="prediction_main">
          <div className={`prediction_signal ${prediction.recommendation.toLowerCase()}`}>
            <span className="signal_label">Signal:</span>
            <span className="signal_value">{prediction.recommendation}</span>
          </div>
          <div className="prediction_confidence">
            <span className="confidence_label">Confidence:</span>
            <span className="confidence_value">{prediction.confidence}</span>
          </div>
        </div>

        <div className="prediction_details">
          <div className="detail_item">
            <span className="detail_label">24h Change:</span>
            <span className={`detail_value ${parseFloat(prediction.priceChange24h) > 0 ? 'positive' : 'negative'}`}>
              {prediction.priceChange24h}%
            </span>
          </div>
          <div className="detail_item">
            <span className="detail_label">ML Prediction:</span>
            <span className={`detail_value ${parseFloat(prediction.mlPrediction) > 0 ? 'positive' : 'negative'}`}>
              {prediction.mlPrediction}%
            </span>
          </div>
          <div className="detail_item">
            <span className="detail_label">Trend:</span>
            <span className="detail_value">{prediction.maSignal}</span>
          </div>
          <div className="detail_item">
            <span className="detail_label">Volatility:</span>
            <span className="detail_value">{prediction.volatility}%</span>
          </div>
        </div>

        <div className="prediction_reasoning">
          <h5>Analysis:</h5>
          <ul>
            {prediction.reasoning.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>

        <div className="prediction_disclaimer">
          <small>
            * This is a basic technical analysis. Cryptocurrency investments are highly volatile.
            Always do your own research and consider consulting financial advisors.
          </small>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;
