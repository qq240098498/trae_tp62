import { Ruler, Plus, X } from 'lucide-react';
import type { Measurement } from '@/types';
import { MEASUREMENT_PARTS } from '@/types';
import { generateId } from '@/utils/helpers';

interface Props {
  measurements: Measurement[];
  onChange: (measurements: Measurement[]) => void;
}

export default function MeasurementsSection({ measurements, onChange }: Props) {
  const addMeasurement = (partName: string, unit: string) => {
    const exists = measurements.find(m => m.partName === partName);
    if (exists) return;
    onChange([
      ...measurements,
      { id: generateId(), partName, originalSize: 0, targetSize: 0, unit },
    ]);
  };

  const updateMeasurement = (id: string, field: 'originalSize' | 'targetSize', value: number) => {
    onChange(
      measurements.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const removeMeasurement = (id: string) => {
    onChange(measurements.filter(m => m.id !== id));
  };

  const availableParts = MEASUREMENT_PARTS.filter(
    p => !measurements.find(m => m.partName === p.name)
  );

  return (
    <div className="card p-6">
      <h2 className="section-title">
        <Ruler className="w-5 h-5 text-gold-500" />
        尺寸测量
      </h2>

      {availableParts.length > 0 && (
        <div className="mb-5">
          <p className="text-sm text-coffee-500 mb-2">添加测量部位：</p>
          <div className="flex flex-wrap gap-2">
            {availableParts.map(part => (
              <button
                key={part.name}
                onClick={() => addMeasurement(part.name, part.unit)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-coffee-50 border border-coffee-200 rounded-lg text-coffee-600 hover:bg-gold-50 hover:border-gold-300 hover:text-gold-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                {part.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {measurements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-coffee-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-coffee-600 w-40">测量部位</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-coffee-600">原尺寸 (cm)</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-coffee-600">目标尺寸 (cm)</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-coffee-600 w-40">变化量</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-coffee-600 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {measurements.map(m => {
                const diff = m.targetSize - m.originalSize;
                return (
                  <tr key={m.id} className="border-b border-coffee-100 hover:bg-coffee-50/50">
                    <td className="py-3 px-4 font-medium text-coffee-800">{m.partName}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={m.originalSize || ''}
                        onChange={e => updateMeasurement(m.id, 'originalSize', Number(e.target.value))}
                        className="input-field text-center w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={m.targetSize || ''}
                        onChange={e => updateMeasurement(m.id, 'targetSize', Number(e.target.value))}
                        className="input-field text-center w-24"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-medium ${
                        diff < 0 ? 'text-green-600' : diff > 0 ? 'text-blue-600' : 'text-coffee-500'
                      }`}>
                        {diff > 0 ? `+${diff}` : diff} cm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => removeMeasurement(m.id)}
                        className="p-2 text-coffee-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <Ruler className="w-10 h-10 text-coffee-300 mx-auto mb-3" />
          <p className="text-coffee-500">暂无测量数据，请点击上方按钮添加测量部位</p>
        </div>
      )}
    </div>
  );
}
