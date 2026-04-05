import { memo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useVisitData } from '../../contexts/VisitDataContext';
import { STATUS_COLORS, STATUS_HOVER_COLORS } from '../../constants/colors';
import { PREFECTURE_NAMES } from '../../constants/prefectures';
import { VisitStatus, VISIT_STATUS_LABELS } from '../../types';

const JAPAN_TOPOJSON = '/geojson/japan.topojson';

const JapanMap = memo(function JapanMap() {
  const { visitData, cycleStatus, drillDown, selectLocation } = useVisitData();
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getPrefCode = (geo: { properties: { id: number; nam_ja: string } }) => {
    return String(geo.properties.id).padStart(2, '0');
  };

  const getStatus = (code: string): VisitStatus => {
    return visitData[code]?.status ?? 'unvisited';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [136, 35.5],
          scale: 1800,
        }}
        width={800}
        height={900}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={JAPAN_TOPOJSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = getPrefCode(geo);
                const status = getStatus(code);
                const name = PREFECTURE_NAMES[code] || geo.properties.nam_ja;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      cycleStatus(code);
                      selectLocation(code);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      drillDown(code);
                    }}
                    onMouseEnter={(e) => {
                      setTooltipContent(
                        `${name}：${VISIT_STATUS_LABELS[status]}`
                      );
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => {
                      setTooltipContent('');
                    }}
                    style={{
                      default: {
                        fill: STATUS_COLORS[status],
                        stroke: '#999',
                        strokeWidth: 0.5,
                        outline: 'none',
                      },
                      hover: {
                        fill: STATUS_HOVER_COLORS[status],
                        stroke: '#666',
                        strokeWidth: 0.8,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        fill: STATUS_HOVER_COLORS[status],
                        stroke: '#333',
                        strokeWidth: 1,
                        outline: 'none',
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 8,
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 13,
            pointerEvents: 'none',
            zIndex: 1000,
            whiteSpace: 'nowrap',
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
});

export default JapanMap;
