import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Database, Clock, Server, ArrowLeft, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function SystemStatus() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealthData(res.data);
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const StatusCard = ({ icon: Icon, title, value, status, subtext }) => (
    <div className="card p-6 border-l-4 border-l-primary-600">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${
          status === 'healthy' ? 'bg-green-100 text-green-600' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
          'bg-red-100 text-red-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
            <p className="text-gray-500">Real-time health monitoring</p>
          </div>
        </div>
        <button 
          onClick={fetchHealth} 
          disabled={loading}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="card p-8 text-center text-red-600 bg-red-50 border border-red-100">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-bold">System Offline</h3>
          <p className="mb-4">{error}</p>
          <button onClick={fetchHealth} className="btn btn-primary">Try Again</button>
        </div>
      ) : !healthData ? (
        <div className="card p-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatusCard 
            icon={Activity} 
            title="API Server"
            value={healthData.status === 'ok' ? 'Online' : 'Degraded'}
            status={healthData.status === 'ok' ? 'healthy' : 'error'}
            subtext={`v${healthData.version || '1.0.0'}`}
          />
          
          <StatusCard 
            icon={Database} 
            title="Database"
            value={healthData.dbStatus === 'connected' ? 'Connected' : 'Disconnected'}
            status={healthData.dbStatus === 'connected' ? 'healthy' : 'error'}
            subtext={healthData.dbLatency ? `${healthData.dbLatency}ms latency` : 'Checking...'}
          />

          <StatusCard 
            icon={Clock} 
            title="Uptime"
            value={formatUptime(healthData.uptime)}
            status="healthy"
            subtext={`Started: ${new Date(Date.now() - (healthData.uptime * 1000)).toLocaleTimeString()}`}
          />

          <div className="col-span-1 md:col-span-2 lg:col-span-3 card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-gray-500" />
              System Resources
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Memory Usage</p>
                <div className="flex items-end gap-2">
                  <span className="text-xl font-bold">{healthData.memory?.heapUsed || 0} MB</span>
                  <span className="text-xs text-gray-400 mb-1">/ {healthData.memory?.heapTotal || 0} MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (healthData.memory?.heapUsed / healthData.memory?.heapTotal) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl">
                 <p className="text-sm text-gray-500 mb-1">Last Restart</p>
                 <span className="text-xl font-bold">{new Date(Date.now() - (healthData.uptime * 1000)).toLocaleDateString()}</span>
                 <p className="text-xs text-gray-500 mt-1">Automatic recovery enabled</p>
              </div>

               <div className="bg-gray-50 p-4 rounded-xl">
                 <p className="text-sm text-gray-500 mb-1">Environment</p>
                 <span className="text-xl font-bold uppercase">{healthData.env || 'Development'}</span>
                 <p className="text-xs text-gray-500 mt-1">Node {healthData.nodeVersion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatUptime(seconds) {
  if (!seconds) return '0s';
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0) return `${Math.floor(seconds)}s`;
  return parts.join(' ');
}

export default SystemStatus;
