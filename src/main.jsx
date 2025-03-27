
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Optimize initial render with concurrent mode and use strict mode for development
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);
