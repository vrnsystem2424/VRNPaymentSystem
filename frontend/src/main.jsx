import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { StrictMode } from 'react';
import App from './App';
import './index.css'  
import {store} from './store';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    <Provider store={store}>
      <StrictMode>
        <App />
      </StrictMode>
    </Provider>
  );
} else {
  console.error('Root element not found!');
}