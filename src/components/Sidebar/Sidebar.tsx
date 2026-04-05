import Statistics from './Statistics';
import Legend from './Legend';
import VisitDetail from './VisitDetail';

export default function Sidebar() {
  return (
    <aside
      style={{
        width: 280,
        borderLeft: '1px solid #e0e0e0',
        padding: '12px 16px',
        overflowY: 'auto',
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <Statistics />
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} />
      <VisitDetail />
      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: 0 }} />
      <Legend />
    </aside>
  );
}
