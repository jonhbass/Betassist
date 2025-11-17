import './css/App.css';
import { BrowserRouter } from 'react-router-dom';
import { Routers } from './routers/routers';
import SupportButton from './componets/SupportButton';

function App() {
  return (
    <BrowserRouter>
      <Routers />
      <SupportButton />
    </BrowserRouter>
  );
}

export default App;
