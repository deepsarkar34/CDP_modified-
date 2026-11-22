import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import Presenter from './presenter/Presenter';
import { startSync } from './sync';

startSync();
const isPresenter = new URLSearchParams(location.search).has('presenter');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPresenter ? <Presenter /> : <App />}</StrictMode>,
);
