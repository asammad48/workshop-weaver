import { createRoot } from 'react-dom/client';
import App from './App';
import { initializeI18n } from './i18n';

initializeI18n();

createRoot(document.getElementById('root')!).render(<App />);
