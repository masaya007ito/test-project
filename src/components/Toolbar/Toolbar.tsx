import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useVisitData } from '../../contexts/VisitDataContext';
import { exportVisitDataAsJSON, parseVisitDataJSON } from '../../utils/storage';

export default function Toolbar() {
  const { visitData, importData } = useVisitData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const json = exportVisitDataAsJSON(visitData);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `japan-visit-data-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const data = parseVisitDataJSON(text);
      if (data) {
        if (window.confirm('現在のデータを上書きしますか？')) {
          importData(data);
        }
      } else {
        alert('無効なJSONファイルです');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleScreenshot = async () => {
    const el = document.getElementById('map-container');
    if (!el) return;
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      saveAs(dataUrl, `japan-visit-map-${new Date().toISOString().slice(0, 10)}.png`);
    } catch (err) {
      console.error('Screenshot failed:', err);
      alert('スクリーンショットの取得に失敗しました');
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 14px',
    border: '1px solid #ccc',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'background 0.15s',
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid #e0e0e0',
        background: '#fff',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
        日本全国 訪問マップ
      </h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={buttonStyle} onClick={handleExportJSON}>
          データ書出
        </button>
        <button style={buttonStyle} onClick={handleImportJSON}>
          データ読込
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          style={{ ...buttonStyle, background: '#2c3e50', color: '#fff', border: 'none' }}
          onClick={handleScreenshot}
        >
          スクリーンショット
        </button>
      </div>
    </header>
  );
}
