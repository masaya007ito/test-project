import { useVisitData } from '../../contexts/VisitDataContext';
import JapanMap from './JapanMap';
import PrefectureMap from './PrefectureMap';

export default function MapContainer() {
  const { currentView, selectedPrefectureCode } = useVisitData();

  return (
    <div id="map-container" style={{ flex: 1, minHeight: 0, position: 'relative' }}>
      {currentView === 'national' ? (
        <JapanMap />
      ) : selectedPrefectureCode ? (
        <PrefectureMap prefectureCode={selectedPrefectureCode} />
      ) : null}
    </div>
  );
}
