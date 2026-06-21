import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DefectInfo {
  defectDescription: string;
  defectConfirmed: boolean;
}

interface Props {
  data: DefectInfo;
  onChange: (data: DefectInfo) => void;
}

export default function DefectSection({ data, onChange }: Props) {
  const handleChange = (key: keyof DefectInfo, value: string | boolean) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className={`card p-6 border-2 transition-colors ${
      data.defectConfirmed ? 'border-green-200 bg-green-50/30' : 'border-amber-200'
    }`}>
      <h2 className="section-title">
        <AlertTriangle className={`w-5 h-5 ${data.defectConfirmed ? 'text-green-500' : 'text-amber-500'}`} />
        瑕疵责任确认
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="input-label">衣物原有瑕疵描述</label>
          <textarea
            value={data.defectDescription}
            onChange={e => handleChange('defectDescription', e.target.value)}
            placeholder="请详细描述收件时衣物已存在的瑕疵、磨损、污渍等情况..."
            rows={4}
            className="input-field resize-none"
          />
          <p className="text-xs text-coffee-400 mt-1.5">
            记录衣物送修时的原始状态，避免交付时产生纠纷
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <label className="input-label">双方确认</label>
          <button
            type="button"
            onClick={() => handleChange('defectConfirmed', !data.defectConfirmed)}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all text-left ${
              data.defectConfirmed
                ? 'bg-green-500 border-green-600 text-white shadow-md'
                : 'bg-white border-coffee-200 text-coffee-600 hover:border-gold-400 hover:bg-gold-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              data.defectConfirmed ? 'bg-white/20' : 'bg-coffee-100'
            }`}>
              {data.defectConfirmed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-lg">✓</span>
              )}
            </div>
            <div>
              <p className="font-semibold">
                {data.defectConfirmed ? '已确认' : '点击确认瑕疵情况'}
              </p>
              <p className={`text-xs ${data.defectConfirmed ? 'text-white/80' : 'text-coffee-400'}`}>
                {data.defectConfirmed
                  ? '客户与店员已确认衣物原始状态'
                  : '请与客户核对并确认后勾选'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
