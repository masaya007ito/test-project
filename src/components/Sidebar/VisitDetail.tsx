import { useVisitData } from '../../contexts/VisitDataContext';
import { PREFECTURE_NAMES } from '../../constants/prefectures';
import { VISIT_STATUS_LABELS, VisitStatus } from '../../types';
import { STATUS_COLORS } from '../../constants/colors';

const statuses: VisitStatus[] = ['unvisited', 'visited', 'passed', 'lived'];

export default function VisitDetail() {
  const { visitData, selectedCode, setStatus, updateDetail } = useVisitData();

  if (!selectedCode) {
    return (
      <div style={{ padding: '12px 0', color: '#888', fontSize: 13 }}>
        都道府県をクリックして詳細を表示
      </div>
    );
  }

  const record = visitData[selectedCode];
  const status = record?.status ?? 'unvisited';
  const name =
    PREFECTURE_NAMES[selectedCode] || selectedCode;

  return (
    <div style={{ padding: '12px 0' }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: 14 }}>{name}</h4>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
          ステータス
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(selectedCode, s)}
              style={{
                flex: 1,
                padding: '6px 4px',
                fontSize: 11,
                border: status === s ? '2px solid #333' : '1px solid #ddd',
                borderRadius: 4,
                background: STATUS_COLORS[s],
                color: s === 'unvisited' ? '#333' : '#fff',
                cursor: 'pointer',
                fontWeight: status === s ? 'bold' : 'normal',
              }}
            >
              {VISIT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
          訪問日
        </label>
        <input
          type="date"
          value={record?.date || ''}
          onChange={(e) => updateDetail(selectedCode, e.target.value, undefined)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 13,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
          メモ
        </label>
        <textarea
          value={record?.memo || ''}
          onChange={(e) => updateDetail(selectedCode, undefined, e.target.value)}
          placeholder="メモを入力..."
          rows={4}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 13,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
}
