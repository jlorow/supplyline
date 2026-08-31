import { Load } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface LoadCardProps {
  load: Load;
  isSourcing: boolean;
  onSource: (loadId: string) => void;
}

export default function LoadCard({ load, isSourcing, onSource }: LoadCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {load.origin} → {load.destination}
        </h3>
        <StatusBadge status={load.status} />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
        <div>
          <span className="font-medium">Equipment:</span> {load.equipmentType}
        </div>
        <div>
          <span className="font-medium">Pickup:</span> {load.pickupDate}
        </div>
        <div>
          <span className="font-medium">Weight:</span> {load.weight.toLocaleString()} lbs
        </div>
      </div>
      <button
        onClick={() => onSource(load.id)}
        disabled={isSourcing}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          isSourcing
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSourcing ? 'Sourcing...' : 'Source Carriers'}
      </button>
    </div>
  );
}
