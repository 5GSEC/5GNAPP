import './App.css';
import { BsIcon, BsIconProvider } from './bs/bs';

function App() {
  let bsIds = ['a', 'b', 'c'];
  return (
    <BsIconProvider>
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#ffffff', gap: '200px' // Adjust gap as needed
      }}>
        {bsIds.map((bsId, index) => (
          <BsIcon key={index} bsId={bsId} />
        ))}
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
      </div>
    </BsIconProvider>
  );
}

export default App;
