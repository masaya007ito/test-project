import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { useWorldVisit } from '../../contexts/WorldVisitContext';

export default function WorldToolbar() {
  const { visitData, importData } = useWorldVisit();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const json = JSON.stringify(visitData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `world-visit-data-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImportJSON = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data === 'object' && data !== null && window.confirm('\u73FE\u5728\u306E\u30C7\u30FC\u30BF\u3092\u4E0A\u66F8\u304D\u3057\u307E\u3059\u304B\uFF1F')) {
          importData(data);
        }
      } catch {
        alert('\u7121\u52B9\u306AJSON\u30D5\u30A1\u30A4\u30EB\u3067\u3059');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleScreenshot = async () => {
    const el = document.getElementById('world-map-container');
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#ffffff', pixelRatio: 2 });
      saveAs(dataUrl, `world-visit-map-${new Date().toISOString().slice(0, 10)}.png`);
    } catch {
      alert('\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F');
    }
  };

  const buttonStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid #ccc', borderRadius: 6,
    background: '#fff', cursor: 'pointer', fontSize: 13, transition: 'background 0.15s',
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px', borderBottom: '1px solid #e0e0e0', background: '#fff',
    }}>
      <h1 style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#333' }}>
        {'\u4E16\u754C\u63A2\u8A2A\u30DE\u30C3\u30D7'}
      </h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={buttonStyle} onClick={handleExportJSON}>{'\u30C7\u30FC\u30BF\u66F8\u51FA'}</button>
        <button style={buttonStyle} onClick={handleImportJSON}>{'\u30C7\u30FC\u30BF\u8AAD\u8FBC'}</button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />
        <button style={{ ...buttonStyle, background: '#2c3e50', color: '#fff', border: 'none' }} onClick={handleScreenshot}>
          {'\u30B9\u30AF\u30EA\u30FC\u30F3\u30B7\u30E7\u30C3\u30C8'}
        </button>
      </div>
    </header>
  );
}
