import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

const buttonColors = ['#3aa757', '#e8453c', '#f9bb2d', '#4688f1'];

ReactDOM.render(
  <React.StrictMode>
    <div id="buttonDiv">
      {buttonColors.map(color => (
      <button 
        key={color}
        onClick={e => console.log(e)} 
        style={{
          backgroundColor: color,
          height: 30,
          width: 30,
          margin: 10,
          outline: 'none'
        }}/>
      ))}
    </div>
    <div>
      <p>Choose a different background color!</p>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
