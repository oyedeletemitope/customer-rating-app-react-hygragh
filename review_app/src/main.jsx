import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
const client = new ApolloClient({
  uri: process.env.REACT_APP_GCMS_API,
  cache: new InMemoryCache(),
  headers: {
      Authorization: `Bearer ${process.env.REACT_APP_GCMS_AUTH}`,
    },
});
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
