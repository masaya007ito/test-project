import { useVisitData } from '../../contexts/VisitDataContext';
import { computePrefectureStats } from '../../utils/statistics';
import { STATUS_COLORS } from '../../constants/colors';

export default function Statistics() {
  const { visitData } = useVisitData();
  const stats = computePrefectureStats(visitData);
  const visitedTotal = stats.visited + stats.passed + stats.lived;
  const pct = Math.round((visitedTotal / stats.total) * 100);

  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: 14 }}>統計</h4>
      <div
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        {visitedTotal}
        <span style={{ fontSize: 14, fontWeight: 'normal', color: '#888' }}>
          {' '}
          / {stats.total} 都道府県
        </span>
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#888',
          marginBottom: 12,
        }}
      >
        制覇率 {pct}%
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 12,
          background: '#eee',
          borderRadius: 6,
          overflow: 'hidden',
          display: 'flex',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${(stats.lived / stats.total) * 100}%`,
            background: STATUS_COLORS.lived,
          }}
        />
        <div
          style={{
            width: `${(stats.visited / stats.total) * 100}%`,
            background: STATUS_COLORS.visited,
          }}
        />
        <div
          style={{
            width: `${(stats.passed / stats.total) * 100}%`,
            background: STATUS_COLORS.passed,
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <span style={{ color: STATUS_COLORS.lived }}>●</span> 居住経験あり
          </span>
          <span>{stats.lived}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <span style={{ color: STATUS_COLORS.visited }}>●</span> 訪問済み
          </span>
          <span>{stats.visited}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <span style={{ color: STATUS_COLORS.passed }}>●</span> 通過のみ
          </span>
          <span>{stats.passed}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <span style={{ color: '#ccc' }}>●</span> 未訪問
          </span>
          <span>{stats.unvisited}</span>
        </div>
      </div>
    </div>
  );
}
