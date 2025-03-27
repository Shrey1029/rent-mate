
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Optimize initial render with concurrent mode
createRoot(document.getElementById("root")).render(<App />);
