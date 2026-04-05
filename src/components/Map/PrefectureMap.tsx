import { memo, useState, useEffect, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import { useVisitData } from '../../contexts/VisitDataContext';
import { STATUS_COLORS, STATUS_HOVER_COLORS } from '../../constants/colors';
import { PREFECTURE_NAMES } from '../../constants/prefectures';
import { PREFECTURE_GEO } from '../../constants/prefectureGeo';
import { VisitStatus, VISIT_STATUS_LABELS } from '../../types';

interface PrefectureMapProps {
  prefectureCode: string;
}

interface MunicipalityGeo {
  properties: {
    N03_001?: string;
    N03_003?: string;
    N03_004?: string;
    N03_007?: string;
    name?: string;
    code?: string;
    id?: string;
  };
}

const PrefectureMap = memo(function PrefectureMap({ prefectureCode }: PrefectureMapProps) {
  const { visitData, cycleStatus, selectLocation, goBack } = useVisitData();
  const [geoData, setGeoData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const prefName = PREFECTURE_NAMES[prefectureCode] || '';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGeoData(null);
    try {
      const modules = import.meta.glob('../../../public/geojson/municipalities/*.topojson');
      const key = `../../../public/geojson/municipalities/${prefectureCode}.topojson`;
      if (modules[key]) {
        const mod = await modules[key]() as { default: unknown };
        setGeoData(mod.default);
      } else {
        setError(`${prefName}の市区町村データがありません`);
      }
    } catch {
      setError(`${prefName}の市区町村データの読み込みに失敗しました`);
    }
    setLoading(false);
  }, [prefectureCode, prefName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getMuniCode = (geo: MunicipalityGeo): string => {
    return (
      geo.properties.N03_007 ||
      geo.properties.code ||
      geo.properties.id ||
      ''
    );
  };

  const getMuniName = (geo: MunicipalityGeo): string => {
    const parts = [
      geo.properties.N03_003 || '',
      geo.properties.N03_004 || '',
    ].filter(Boolean);
    return parts.length > 0 ? parts.join('') : geo.properties.name || '不明';
  };

  const getStatus = (code: string): VisitStatus => {
    return visitData[code]?.status ?? 'unvisited';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <button
        onClick={goBack}
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 6,
          padding: '6px 14px',
          cursor: 'pointer',
          fontSize: 14,
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}
      >
        ← 全国地図に戻る
      </button>
      <h3
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 5,
          margin: 0,
          fontSize: 18,
          color: '#333',
        }}
      >
        {prefName}
      </h3>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center' }}>読み込み中...</div>
      )}
      {error && (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p>{error}</p>
          <p style={{ fontSize: 13, color: '#888' }}>
            都道府県レベルのステータスはクリックで変更できます
          </p>
        </div>
      )}
      {geoData != null && (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: PREFECTURE_GEO[prefectureCode]?.center ?? [137, 36],
            scale: PREFECTURE_GEO[prefectureCode]?.scale ?? 8000,
          }}
          width={800}
          height={900}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup>
            <Geographies geography={geoData as string | Record<string, unknown>}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = getMuniCode(geo);
                  const name = getMuniName(geo);
                  const status = getStatus(code);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (code) {
                          cycleStatus(code);
                          selectLocation(code);
                        }
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
                      onMouseLeave={() => setTooltipContent('')}
                      style={{
                        default: {
                          fill: STATUS_COLORS[status],
                          stroke: '#999',
                          strokeWidth: 0.3,
                          outline: 'none',
                        },
                        hover: {
                          fill: STATUS_HOVER_COLORS[status],
                          stroke: '#666',
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: 'pointer',
                        },
                        pressed: {
                          fill: STATUS_HOVER_COLORS[status],
                          stroke: '#333',
                          strokeWidth: 0.8,
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
      )}
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

export default PrefectureMap;
