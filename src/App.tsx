import { VisitDataProvider } from './contexts/VisitDataContext';
import MapContainer from './components/Map/MapContainer';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';

export default function App() {
  return (
    <VisitDataProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif',
        }}
      >
        <Toolbar />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <MapContainer />
          <Sidebar />
        </div>
      </div>
    </VisitDataProvider>
  );
}
