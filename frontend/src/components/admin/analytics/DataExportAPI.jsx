import React, { useState, useCallback } from 'react';
import {
  Download,
  Key,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Copy,
  RefreshCw,
  Settings,
  Database,
  FileJson,
  FileSpreadsheet,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';
import './DataExportAPI.css';

const DataExportAPI = ({ onExport }) => {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production API Key',
      key: 'pk_live_xxxxxxxxxxxxxxxxxxxxx',
      created: '2024-01-15',
      lastUsed: '2024-12-25',
      status: 'active',
      rateLimit: 1000,
      usageToday: 245
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxx',
      created: '2024-02-01',
      lastUsed: '2024-12-24',
      status: 'active',
      rateLimit: 100,
      usageToday: 12
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(100);
  const [visibleKeys, setVisibleKeys] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/export/children',
      description: "Bolalar ro'yxatini eksport qilish",
      params: ['format', 'group_id', 'status']
    },
    {
      method: 'GET',
      path: '/api/export/attendance',
      description: 'Davomat ma\'lumotlarini eksport qilish',
      params: ['format', 'start_date', 'end_date', 'group_id']
    },
    {
      method: 'GET',
      path: '/api/export/payments',
      description: "To'lov tarixini eksport qilish",
      params: ['format', 'start_date', 'end_date', 'status']
    },
    {
      method: 'GET',
      path: '/api/export/reports',
      description: 'Hisobotlarni eksport qilish',
      params: ['format', 'report_type', 'period']
    }
  ];

  const rateLimitTiers = [
    { requests: 100, period: 'soat', tier: 'Basic' },
    { requests: 1000, period: 'soat', tier: 'Pro' },
    { requests: 10000, period: 'soat', tier: 'Enterprise' }
  ];

  const handleCreateKey = useCallback(() => {
    if (!newKeyName.trim()) return;

    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: `pk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: null,
      status: 'active',
      rateLimit: newKeyRateLimit,
      usageToday: 0
    };

    setApiKeys(prev => [...prev, newKey]);
    setShowKeyModal(newKey);
    setShowCreateModal(false);
    setNewKeyName('');
    setNewKeyRateLimit(100);
  }, [newKeyName, newKeyRateLimit]);

  const handleRevokeKey = useCallback((keyId) => {
    setApiKeys(prev => prev.map(k => 
      k.id === keyId ? { ...k, status: 'revoked' } : k
    ));
  }, []);

  const handleRegenerateKey = useCallback((keyId) => {
    const newKeyValue = `pk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys(prev => prev.map(k => 
      k.id === keyId ? { ...k, key: newKeyValue } : k
    ));
  }, []);

  const handleCopyKey = useCallback((key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const toggleKeyVisibility = useCallback((keyId) => {
    setVisibleKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  }, []);

  const maskKey = (key) => {
    return key.substring(0, 8) + '••••••••••••••••';
  };

  return (
    <div className="data-export-api">
      <div className="api-header">
        <div className="api-title">
          <Database size={24} />
          <div>
            <h2>Data Export API</h2>
            <p>REST API orqali ma'lumotlarni eksport qilish</p>
          </div>
        </div>
        <button 
          className="btn-create-key"
          onClick={() => setShowCreateModal(true)}
        >
          <Key size={16} />
          Yangi API kalit
        </button>
      </div>

      {/* API Keys Section */}
      <div className="api-section">
        <h3>
          <Key size={18} />
          API Kalitlar
        </h3>
        <div className="api-keys-list">
          {apiKeys.map(apiKey => (
            <div key={apiKey.id} className={`api-key-card ${apiKey.status}`}>
              <div className="key-header">
                <div className="key-info">
                  <span className="key-name">{apiKey.name}</span>
                  <span className={`key-status ${apiKey.status}`}>
                    {apiKey.status === 'active' ? (
                      <><CheckCircle size={12} /> Faol</>
                    ) : (
                      <><AlertCircle size={12} /> Bekor qilingan</>
                    )}
                  </span>
                </div>
                <div className="key-actions">
                  <button
                    className="btn-icon"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    title={visibleKeys[apiKey.id] ? "Yashirish" : "Ko'rsatish"}
                  >
                    {visibleKeys[apiKey.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleCopyKey(apiKey.key)}
                    title="Nusxa olish"
                  >
                    {copiedKey === apiKey.key ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                  {apiKey.status === 'active' && (
                    <>
                      <button
                        className="btn-icon"
                        onClick={() => handleRegenerateKey(apiKey.id)}
                        title="Qayta yaratish"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => handleRevokeKey(apiKey.id)}
                        title="Bekor qilish"
                      >
                        <Lock size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="key-value">
                <code>{visibleKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}</code>
              </div>
              <div className="key-meta">
                <span><Clock size={12} /> Yaratilgan: {apiKey.created}</span>
                <span>Oxirgi ishlatilgan: {apiKey.lastUsed || 'Hech qachon'}</span>
                <span>Bugun: {apiKey.usageToday}/{apiKey.rateLimit} so'rov</span>
              </div>
              <div className="key-usage-bar">
                <div 
                  className="usage-fill"
                  style={{ width: `${(apiKey.usageToday / apiKey.rateLimit) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="api-section">
        <h3>
          <Settings size={18} />
          API Endpoints
        </h3>
        <div className="endpoints-list">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="endpoint-card">
              <div className="endpoint-header">
                <span className={`method ${endpoint.method.toLowerCase()}`}>
                  {endpoint.method}
                </span>
                <code className="endpoint-path">{endpoint.path}</code>
              </div>
              <p className="endpoint-description">{endpoint.description}</p>
              <div className="endpoint-params">
                <span className="params-label">Parametrlar:</span>
                {endpoint.params.map((param, i) => (
                  <code key={i} className="param">{param}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rate Limiting Section */}
      <div className="api-section">
        <h3>
          <Shield size={18} />
          Rate Limiting
        </h3>
        <div className="rate-limit-tiers">
          {rateLimitTiers.map((tier, index) => (
            <div key={index} className="tier-card">
              <h4>{tier.tier}</h4>
              <div className="tier-limit">
                <span className="limit-number">{tier.requests.toLocaleString()}</span>
                <span className="limit-period">so'rov/{tier.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Formats */}
      <div className="api-section">
        <h3>
          <Download size={18} />
          Eksport Formatlari
        </h3>
        <div className="formats-grid">
          <div className="format-card">
            <FileJson size={32} />
            <h4>JSON</h4>
            <p>format=json</p>
          </div>
          <div className="format-card">
            <FileSpreadsheet size={32} />
            <h4>CSV</h4>
            <p>format=csv</p>
          </div>
          <div className="format-card">
            <FileSpreadsheet size={32} />
            <h4>Excel</h4>
            <p>format=xlsx</p>
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="api-section">
        <h3>Namuna kod</h3>
        <div className="code-example">
          <pre>{`// JavaScript/Node.js
const response = await fetch('https://api.playkids.uz/api/export/children', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  params: {
    format: 'json',
    status: 'active'
  }
});

const data = await response.json();`}</pre>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Yangi API kalit yaratish</h3>
            <div className="form-group">
              <label>Kalit nomi</label>
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="Masalan: Production API"
              />
            </div>
            <div className="form-group">
              <label>Rate limit (soatiga)</label>
              <select
                value={newKeyRateLimit}
                onChange={e => setNewKeyRateLimit(Number(e.target.value))}
              >
                <option value={100}>100 - Basic</option>
                <option value={1000}>1,000 - Pro</option>
                <option value={10000}>10,000 - Enterprise</option>
              </select>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Bekor qilish
              </button>
              <button 
                className="btn-primary"
                onClick={handleCreateKey}
                disabled={!newKeyName.trim()}
              >
                Yaratish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Key Created Modal */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h3>API kalit yaratildi!</h3>
            <p className="warning-text">
              <AlertCircle size={16} />
              Bu kalitni xavfsiz joyda saqlang. Qayta ko'rsatilmaydi!
            </p>
            <div className="new-key-display">
              <code>{showKeyModal.key}</code>
              <button
                className="btn-copy"
                onClick={() => handleCopyKey(showKeyModal.key)}
              >
                {copiedKey === showKeyModal.key ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button 
              className="btn-primary"
              onClick={() => setShowKeyModal(null)}
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExportAPI;
