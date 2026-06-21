import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, Ruler, Calendar, Trash2, FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import PageContent from '@/components/PageContent';
import { useCustomerStore } from '@/store/customerStore';
import type { CustomerProfile } from '@/types';
import { BODY_MEASUREMENT_KEYS } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function CustomerList() {
  const { profiles, searchProfiles, deleteProfile } = useCustomerStore();
  const [searchKeyword, setSearchKeyword] = useState('');

  const filteredProfiles = useMemo(() => {
    const result = searchKeyword ? searchProfiles(searchKeyword) : profiles;
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [profiles, searchKeyword, searchProfiles]);

  const handleDelete = (profile: CustomerProfile) => {
    if (confirm(`确定要删除顾客「${profile.customerName}」的档案吗？此操作不可撤销。`)) {
      deleteProfile(profile.id);
    }
  };

  const getFilledMeasurementsCount = (profile: CustomerProfile) => {
    return BODY_MEASUREMENT_KEYS.filter(k => profile.bodyMeasurements[k.key] !== undefined).length;
  };

  return (
    <>
      <PageHeader
        title="顾客档案"
        description="管理顾客量体数据，历史记录一目了然"
        actions={
          <Link to="/customers/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新建档案
          </Link>
        }
      />
      <PageContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">顾客总数</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">{profiles.length}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Ruler className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">有完整量体数据</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">
                  {profiles.filter(p => getFilledMeasurementsCount(p) >= 5).length}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">累计下单次数</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">
                  {profiles.reduce((sum, p) => sum + p.orderCount, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-coffee-500">近30天活跃</p>
                <p className="text-2xl font-serif font-bold text-coffee-800">
                  {profiles.filter(p => {
                    const days = (Date.now() - new Date(p.lastMeasurementDate).getTime()) / (1000 * 60 * 60 * 24);
                    return days <= 30;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索顾客姓名或手机号..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProfiles.map(profile => {
              const filledCount = getFilledMeasurementsCount(profile);
              return (
                <div
                  key={profile.id}
                  className="card p-5 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-serif font-bold text-white">
                          {profile.customerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-coffee-800">
                          {profile.customerName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-coffee-500 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{profile.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(profile)}
                      className="p-2 text-coffee-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="删除档案"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-coffee-500 flex items-center gap-1.5">
                        <Ruler className="w-4 h-4" />
                        量体数据
                      </span>
                      <span className="text-sm font-medium text-coffee-700">
                        {filledCount}/{BODY_MEASUREMENT_KEYS.length} 项
                      </span>
                    </div>
                    <div className="w-full bg-coffee-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          filledCount >= 5 ? 'bg-green-500' : filledCount >= 3 ? 'bg-gold-500' : 'bg-coffee-400'
                        }`}
                        style={{ width: `${(filledCount / BODY_MEASUREMENT_KEYS.length) * 100}%` }}
                      ></div>
                    </div>
                    {filledCount > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {BODY_MEASUREMENT_KEYS.map(k => {
                          const val = profile.bodyMeasurements[k.key];
                          if (val === undefined) return null;
                          return (
                            <span
                              key={k.key}
                              className="inline-flex items-center gap-0.5 text-xs bg-coffee-50 text-coffee-600 px-2 py-0.5 rounded"
                            >
                              <span className="font-medium">{k.label}</span>
                              <span>{val}{k.unit}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-coffee-100">
                    <div className="flex items-center gap-4 text-xs text-coffee-500">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {profile.orderCount} 次订单
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(profile.lastMeasurementDate)}
                      </span>
                    </div>
                    <Link
                      to={`/customers/${profile.id}`}
                      className="text-sm font-medium text-gold-600 hover:text-gold-700 inline-flex items-center gap-1"
                    >
                      查看详情 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-16 text-center">
            <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-coffee-400" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-coffee-700 mb-2">暂无顾客档案</h3>
            <p className="text-coffee-500 mb-6">
              {searchKeyword ? '未找到匹配的顾客，请尝试其他关键词' : '点击上方按钮创建第一个顾客档案'}
            </p>
            {!searchKeyword && (
              <Link to="/customers/new" className="btn-primary inline-flex items-center gap-2">
                <Plus className="w-5 h-5" />
                新建档案
              </Link>
            )}
          </div>
        )}
      </PageContent>
    </>
  );
}
