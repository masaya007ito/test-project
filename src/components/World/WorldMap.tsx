import { memo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useWorldVisit } from '../../contexts/WorldVisitContext';
import { STATUS_COLORS, STATUS_HOVER_COLORS } from '../../constants/colors';
import { COUNTRY_NAMES } from '../../constants/countries';
import { VisitStatus, VISIT_STATUS_LABELS } from '../../types';
import worldTopo from '../../../public/geojson/world-countries.topojson';

const WorldMap = memo(function WorldMap() {
  const { visitData, cycleStatus, selectLocation } = useWorldVisit();
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getStatus = (code: string): VisitStatus => {
    return visitData[code]?.status ?? 'unvisited';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [0, 30],
          scale: 130,
        }}
        width={960}
        height={500}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={worldTopo as string | Record<string, unknown>}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const code = geo.id || geo.properties?.id || '';
                const status = getStatus(code);
                const name = COUNTRY_NAMES[code] || geo.properties?.name || '';
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      cycleStatus(code);
                      selectLocation(code);
                    }}
                    onMouseEnter={(e) => {
                      setTooltipContent(`${name}\uFF1A${VISIT_STATUS_LABELS[status]}`);
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseMove={(e) => {
                      setTooltipPos({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setTooltipContent('')}
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

export default WorldMap;
