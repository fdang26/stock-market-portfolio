import { useState, useEffect } from 'react';
import './App.css';
import { Card, CardHeader, CardBody, CardFooter, Button } from 'reactstrap';
import StockList from './StockList';

function App() {
  const AWS_API_GATEWAY = 'https://l30wyokbr6.execute-api.us-east-1.amazonaws.com/prod';
  const AWS_API_GATEWAY_GET_PORTFOLIO = AWS_API_GATEWAY + '/get-portfolio';
  const AWS_API_GATEWAY_GET_STOCK_PRICE = AWS_API_GATEWAY + '/get-stock-price';
  // Uncomment setMyName if required, for example, if the name
  // is stored in the DynamoDB
  const [myName/*, setMyName*/] = useState('Roger');
  
  const [stocks, setStocks] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [tickerList, setTickerList] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  
  
  
  
  // Retrieve the current stock information when the page first loads
  useEffect(() => {
    const options = {
      method: 'POST',
      cache: 'default'
    };
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
          let stockList = response.Items.map(item => {
            item.name = item.name.S;
            item.purchasePrice = item.purchasePrice.N;
            item.shares = item.shares.N;
            item.ticker = item.ticker.S;
            return(item);
          });
          setStocks(stockList);
        })
        .catch(function(error) {
          console.log(error);
        })
  };
  
  
  
  //adds the simulated real-time stock information
    useEffect(() => {
      let promises = tickerList.map(ticker => getStockPrice(ticker));
      Promise.all(promises)
        .then(function(stocks){
          console.log(stocks);
          const stockPrices = stocks.reduce((obj, stock) => {
            const info = {
              name: stock.data ? stock.data.longName : null,
              price: stock.data ? stock.data.regularMarketPrice : null
            }
            obj[stock.ticker] = info;
            return obj;
          }, {});
      setStockPrices(stockPrices);
      console.log(stockPrices);

        });
    }, [tickerList])

  
  
  
  //event handler than logs a message to the console 
  //when the add stock button is pushed
  const addStock = evt => {
    console.log('add stock clicked');
    getStockPrice("GOOG");
  };



  //triggers when stocks is updated; calls createTickerList
  useEffect(() => {
    setTickerList(createTickerList(stocks));
  },[stocks]);
  //retrieves the the tickers from stockList as an array 
  function createTickerList(stockInput){
    let tickers = stockInput.reduce(function (arr, current) {
      arr.push(current.ticker);
      return arr;
    },[]);
    return tickers;
  }
  
  
  //retrieves the stock price using corresponding its ticker symbol
  function getStockPrice(ticker){
    return new Promise((resolve,reject)=>{
      const fetchOptions = {
        method: 'POST',
        cache: 'default',
        body: JSON.stringify({ticker: ticker})
      };
      
      fetch(AWS_API_GATEWAY_GET_STOCK_PRICE, fetchOptions)
        .then(function(response) {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(function(response) {
          let ticker = response.ticker;
          let data = response.data;
          let value = {data, ticker};
          // console.log(response);
          resolve(value);
        })
        .catch(function(error){
          reject(error);
        });
    });
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
