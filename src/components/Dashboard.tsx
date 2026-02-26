import { Search, Bell } from 'lucide-react';
import ModelCard, { ModelCardProps } from './ModelCard';

const models: ModelCardProps[] = [
  { name: 'QuantumLeap v2.1', accuracy: 98.2, loss: 0.03, latency: '12ms', status: 'Active' },
  { name: 'NebulaNet-3', accuracy: 95.7, loss: 0.05, latency: '25ms', status: 'Inactive' },
  { name: 'Cognito-X', accuracy: 97.1, loss: 0.04, latency: '18ms', status: 'Active' },
  { name: 'Synapse-7B', accuracy: 96.5, loss: 0.045, latency: '22ms', status: 'Training' },
];

export default function Dashboard() {
  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">Dashboard</h1>
          <p className="text-gray-400">Welcome back, AI Architect!</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search models..." className="w-64 bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          </div>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10">
            <Bell className="text-gray-300" />
          </button>
          <img src="https://i.pravatar.cc/40" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-cyan-400" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {models.map((model, index) => (
          <ModelCard key={index} {...model} />
        ))}
      </div>
    </div>
  );
}
