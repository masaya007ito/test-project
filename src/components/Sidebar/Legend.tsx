import { STATUS_COLORS } from '../../constants/colors';
import { VISIT_STATUS_LABELS, VisitStatus } from '../../types';

const statuses: VisitStatus[] = ['unvisited', 'visited', 'passed', 'lived'];

export default function Legend() {
  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>凡例</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {statuses.map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 3,
                background: STATUS_COLORS[s],
                border: '1px solid #ccc',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13 }}>{VISIT_STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
        クリック: ステータス切替 / ダブルクリック: 市区町村表示
      </p>
    </div>
  );
}
