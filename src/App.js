import { useState, useEffect } from 'react';
import './App.css';
import { Card, CardHeader, CardBody, CardFooter, Button } from 'reactstrap';
import StockList from './StockList';

function App() {
  const AWS_API_GATEWAY = 'https://l30wyokbr6.execute-api.us-east-1.amazonaws.com/prod';
  const AWS_API_GATEWAY_GET_PORTFOLIO = AWS_API_GATEWAY + '/get-portfolio';
  // Uncomment setMyName if required, for example, if the name
  // is stored in the DynamoDB
  const [myName/*, setMyName*/] = useState('Roger');
  
  const [stocks, setStocks] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [tickerList, setTickerList] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const options = {
      method: 'POST',
      cache: 'default'
    };
  // Retrieve the current stock information when the page first loads
  useEffect(() => {
    getPortfolio(AWS_API_GATEWAY_GET_PORTFOLIO, options);
  }, []);
  
  
  // the fetch function; retreives portfolio data
  function getPortfolio(param1, param2){
    fetch(param1, param2)
        .then(function(response) {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(function(response) {
          console.log(response);
          let stockList = response.Items.map(item => {
            item.name = item.name.S;
            item.purchasePrice = item.purchasePrice.N;
            item.shares = item.shares.N;
            item.ticker = item.ticker.S;
            return(item);
          });
          setStocks(stockList);
          console.log(stockList);
        })
        .catch(function(error) {
          console.log(error);
        })
  };
  // With the stock data add purchase value, current price
  // and current value to the stock record
  useEffect(() => {
    const enhancedStocks = stocks.map(stock => {
      stock.purchaseValue = stock.shares * stock.purchasePrice;
      stock.currentPrice = Math.random()*200 + 50;
      stock.currentValue = stock.shares * stock.currentPrice;
      stock.profit = stock.currentValue - stock.purchaseValue;
      return stock;
    })
    setStockList(enhancedStocks);
  }, [stocks])
  
  
  //event handler than logs a message to the console when the add stock button is pushed
  const addStock = evt => {
    console.log('add stock clicked');
  }

  //triggers when stockList is updated; it takes the stockList and makes a list of the tickers
  useEffect(() => {
    setTickerList(getTickerList(stockList));
  },[stockList])
  //retrieves the the tickers from stockList as an array 
  function getTickerList(stocks){
    let tickers = stocks.reduce(function (arr, current) {
      arr.push(current.ticker);
      return arr;
    },[]);
    return tickers;
  }
  
  return (
    <div className="App">
      <Card>
        <CardHeader className="card-header-color">
          <h4>{myName}'s Stock Portfolio</h4>
        </CardHeader>
        <CardBody>
          <StockList data={stockList} />
        </CardBody>
        <CardFooter>
          <Button size="sm" onClick={addStock}>Add stock</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
