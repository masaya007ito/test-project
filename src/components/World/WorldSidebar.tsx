import { useWorldVisit } from '../../contexts/WorldVisitContext';
import { COUNTRY_NAMES, COUNTRY_CODES } from '../../constants/countries';
import { VISIT_STATUS_LABELS, VisitStatus } from '../../types';
import { STATUS_COLORS } from '../../constants/colors';

const statuses: VisitStatus[] = ['unvisited', 'visited', 'passed', 'lived'];

function WorldStatistics() {
  const { visitData } = useWorldVisit();
  const total = COUNTRY_CODES.length;
  let visited = 0, passed = 0, lived = 0;
  for (const code of COUNTRY_CODES) {
    const s = visitData[code]?.status;
    if (s === 'visited') visited++;
    else if (s === 'passed') passed++;
    else if (s === 'lived') lived++;
  }
  const visitedTotal = visited + passed + lived;
  const pct = Math.round((visitedTotal / total) * 100);

  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: 14 }}>{'\u7D71\u8A08'}</h4>
      <div style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
        {visitedTotal}
        <span style={{ fontSize: 14, fontWeight: 'normal', color: '#888' }}> / {total} {'\u30AB\u56FD'}</span>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 12 }}>
        {'\u5236\u8987\u7387'} {pct}%
      </div>
      <div style={{ height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
        <div style={{ width: `${(lived / total) * 100}%`, background: STATUS_COLORS.lived }} />
        <div style={{ width: `${(visited / total) * 100}%`, background: STATUS_COLORS.visited }} />
        <div style={{ width: `${(passed / total) * 100}%`, background: STATUS_COLORS.passed }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><span style={{ color: STATUS_COLORS.lived }}>{'\u25CF'}</span> {VISIT_STATUS_LABELS.lived}</span><span>{lived}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><span style={{ color: STATUS_COLORS.visited }}>{'\u25CF'}</span> {VISIT_STATUS_LABELS.visited}</span><span>{visited}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><span style={{ color: STATUS_COLORS.passed }}>{'\u25CF'}</span> {VISIT_STATUS_LABELS.passed}</span><span>{passed}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><span style={{ color: '#ccc' }}>{'\u25CF'}</span> {VISIT_STATUS_LABELS.unvisited}</span><span>{total - visitedTotal}</span>
        </div>
      </div>
    </div>
  );
}

function WorldVisitDetail() {
  const { visitData, selectedCode, setStatus, updateDetail } = useWorldVisit();
  if (!selectedCode) {
    return <div style={{ padding: '12px 0', color: '#888', fontSize: 13 }}>{'\u56FD\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u3066\u8A73\u7D30\u3092\u8868\u793A'}</div>;
  }
  const record = visitData[selectedCode];
  const status = record?.status ?? 'unvisited';
  const name = COUNTRY_NAMES[selectedCode] || selectedCode;

  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: 14 }}>{name}</h4>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{'\u30B9\u30C6\u30FC\u30BF\u30B9'}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(selectedCode, s)}
              style={{
                flex: 1, padding: '6px 4px', fontSize: 11,
                border: status === s ? '2px solid #333' : '1px solid #ddd',
                borderRadius: 4, background: STATUS_COLORS[s],
                color: s === 'unvisited' ? '#333' : '#fff',
                cursor: 'pointer', fontWeight: status === s ? 'bold' : 'normal',
              }}
            >
              {VISIT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{'\u8A2A\u554F\u65E5'}</label>
        <input
          type="date" value={record?.date || ''}
          onChange={(e) => updateDetail(selectedCode, e.target.value, undefined)}
          style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{'\u30E1\u30E2'}</label>
        <textarea
          value={record?.memo || ''}
          onChange={(e) => updateDetail(selectedCode, undefined, e.target.value)}
          placeholder={'\u30E1\u30E2\u3092\u5165\u529B...'}
          rows={4}
          style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}

function WorldLegend() {
  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>{'\u51E1\u4F8B'}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {statuses.map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 3, background: STATUS_COLORS[s], border: '1px solid #ccc', flexShrink: 0 }} />
            <span style={{ fontSize: 13 }}>{VISIT_STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>{'\u30AF\u30EA\u30C3\u30AF: \u30B9\u30C6\u30FC\u30BF\u30B9\u5207\u66FF'}</p>
    </div>
  );
}

export default function WorldSidebar() {
  return (
    <aside style={{
      width: 280, borderLeft: '1px solid #e0e0e0', padding: '12px 16px',
      overflowY: 'auto', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <WorldStatistics />
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} />
      <WorldVisitDetail />
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} />
      <WorldLegend />
    </aside>
  );
}
