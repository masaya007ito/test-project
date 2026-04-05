import { WorldVisitProvider } from './contexts/WorldVisitContext';
import WorldMap from './components/World/WorldMap';
import WorldSidebar from './components/World/WorldSidebar';
import WorldToolbar from './components/World/WorldToolbar';

export default function WorldApp() {
  return (
    <WorldVisitProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif',
        }}
      >
        <WorldToolbar />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <div id="world-map-container" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <WorldMap />
          </div>
          <WorldSidebar />
        </div>
      </div>
    </WorldVisitProvider>
  );
}
