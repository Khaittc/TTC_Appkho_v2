import React, { useState } from 'react';
import { 
  getDevelopmentStatus, 
  getSummary, 
  getCurrentModule, 
  getUISummary, 
  getCurrentUI 
} from '../development/developmentStatus';
import { Clock, PlayCircle, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { IS_DEMO_MODE } from '../config/env';
import { Navigate } from 'react-router-dom';
import { DevelopmentStatus } from '../development/types';

const statusConfig: Record<DevelopmentStatus, { label: string; color: string; icon: any; bg: string }> = {
  ACCEPTED: { label: 'Đã chốt', color: 'text-green-700', bg: 'bg-green-100', icon: Lock },
  READY_FOR_ACCEPTANCE: { label: 'Chờ nghiệm thu', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  ACTIVE: { label: 'Đang triển khai', color: 'text-blue-700', bg: 'bg-blue-100', icon: PlayCircle },
  BLOCKED: { label: 'Chưa mở', color: 'text-slate-500', bg: 'bg-slate-100', icon: Lock },
  ELIGIBLE: { label: 'Đủ điều kiện', color: 'text-purple-700', bg: 'bg-purple-100', icon: PlayCircle },
  NEEDS_FIX: { label: 'Cần sửa', color: 'text-red-700', bg: 'bg-red-100', icon: AlertCircle },
};

export function DevelopmentRoadmapPage() {
  if (!IS_DEMO_MODE) {
    return <Navigate to="/" replace />;
  }

  const [activeTrack, setActiveTrack] = useState<'UI' | 'MODULES'>('UI');
  const [expandedUI, setExpandedUI] = useState<string | null>(null);

  const statusData = getDevelopmentStatus();
  const summary = getSummary();
  const currentModule = getCurrentModule();

  const uiSummary = getUISummary();
  const currentUI = getCurrentUI();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-xs">
            UI PROTOTYPE FIRST
          </span>
          <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold px-2 py-0.5 rounded border border-slate-200">
            BUSINESS DEVELOPMENT · FROZEN
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Tiến độ phát triển</h1>
        <p className="text-slate-500 mt-1">Theo dõi tiến độ UI Prototype và các module phát triển của TTC Material Hub</p>
      </div>

      {/* Track Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTrack('UI')}
          className={cn(
            "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 -mb-px",
            activeTrack === 'UI'
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <span>UI Prototype</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-semibold",
            activeTrack === 'UI' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
          )}>
            {uiSummary.progress}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTrack('MODULES')}
          className={cn(
            "px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 -mb-px",
            activeTrack === 'MODULES'
              ? "border-indigo-600 text-indigo-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          )}
        >
          <span>Business Modules</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-normal">
            Frozen
          </span>
        </button>
      </div>

      {/* UI Prototype Track */}
      {activeTrack === 'UI' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Đã chốt</span>
              <span className="text-3xl font-bold text-green-600 mt-1">{uiSummary.accepted}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Chờ nghiệm thu</span>
              <span className="text-3xl font-bold text-amber-500 mt-1">{uiSummary.ready}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Đang triển khai</span>
              <span className="text-3xl font-bold text-blue-600 mt-1">{uiSummary.active}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Chưa mở / Khóa</span>
              <span className="text-3xl font-bold text-slate-500 mt-1">{uiSummary.blocked}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-700">Tiến độ UI Prototype</span>
              <span className="text-indigo-600 font-semibold">{uiSummary.progress}% ({uiSummary.accepted} / {uiSummary.total} UI)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${uiSummary.progress}%` }}
              />
            </div>
          </div>

          {currentUI && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">UI HIỆN TẠI</h2>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-1 flex-1">
                  <h3 className="text-xl font-bold text-indigo-900">UI-{currentUI.id}</h3>
                  <p className="text-lg text-indigo-700 font-medium">{currentUI.name}</p>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold uppercase mb-1">Trạng thái</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium",
                        statusConfig[currentUI.status].bg,
                        statusConfig[currentUI.status].color
                      )}>
                        {React.createElement(statusConfig[currentUI.status].icon, { className: "w-4 h-4" })}
                        {statusConfig[currentUI.status].label}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold uppercase mb-1">Checkpoint</p>
                    <code className="text-sm bg-white/60 px-2 py-1 rounded border border-indigo-100 text-indigo-900 font-mono">
                      {currentUI.checkpoint || 'Chưa tạo'}
                    </code>
                  </div>
                </div>

                <div className="flex-1 bg-white/50 p-4 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-400 font-semibold uppercase mb-2">Bước tiếp theo</p>
                  <p className="text-sm text-indigo-800 flex flex-wrap items-center gap-1.5">
                    <span>Thiết kế</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>Review source</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>Test UI</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>Nghiệm thu</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span className="font-semibold text-indigo-900">UI_ACCEPTED</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium w-24">#</th>
                    <th className="px-6 py-4 font-medium">UI Prototype</th>
                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                    <th className="px-6 py-4 font-medium">Phụ thuộc</th>
                    <th className="px-6 py-4 font-medium">Checkpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusData.uiPrototype.map((uiItem) => {
                    const config = statusConfig[uiItem.status];
                    const isAccepted = uiItem.status === 'ACCEPTED';
                    const isExpanded = expandedUI === uiItem.id;
                    
                    return (
                      <React.Fragment key={uiItem.id}>
                        <tr className={cn(
                          "hover:bg-slate-50 transition-colors",
                          uiItem.status === 'ACTIVE' && "bg-blue-50/30",
                          isAccepted && "opacity-75"
                        )}>
                          <td className="px-6 py-4 font-medium text-slate-500 font-mono">UI-{uiItem.id}</td>
                          <td className={cn("px-6 py-4 font-medium", isAccepted ? "text-slate-700" : "text-slate-900")}>
                            <div className="flex items-center gap-2">
                              <span>{uiItem.name}</span>
                              {uiItem.scope && uiItem.scope.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedUI(isExpanded ? null : uiItem.id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 font-normal hover:underline ml-2"
                                >
                                  {isExpanded ? 'Ẩn phạm vi' : 'Xem phạm vi'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2" title={isAccepted ? "UI đã được nghiệm thu. Chỉ thay đổi bằng UI Change Request hoặc task polish được phê duyệt." : undefined}>
                              {isAccepted && <Lock className="w-4 h-4 text-green-600 shrink-0" />}
                              <span className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5",
                                config.bg, 
                                config.color,
                                `border-${config.color.split('-')[1]}-200`
                              )}>
                                {config.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {uiItem.status === 'BLOCKED' && uiItem.dependsOn.length > 0 ? (
                              <span className="text-xs">Chờ UI-{uiItem.dependsOn.join(', UI-')}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {uiItem.checkpoint ? (
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                                {uiItem.checkpoint}
                              </code>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && uiItem.scope && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={5} className="px-6 py-3 border-t border-slate-100">
                              <div className="text-xs text-slate-600">
                                <span className="font-semibold text-slate-700 mr-2">Phạm vi UI:</span>
                                <span className="inline-flex flex-wrap gap-1.5 mt-1">
                                  {uiItem.scope.map((item, idx) => (
                                    <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                                      {item}
                                    </span>
                                  ))}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Business Modules Track */}
      {activeTrack === 'MODULES' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">BUSINESS DEVELOPMENT · FROZEN</p>
              <p className="text-sm text-amber-900 mt-0.5">Tạm dừng phát triển nghiệp vụ trong khi hoàn thiện UI Prototype.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Đã chốt</span>
              <span className="text-3xl font-bold text-green-600 mt-1">{summary.accepted}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Chờ nghiệm thu</span>
              <span className="text-3xl font-bold text-amber-500 mt-1">{summary.ready}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Đang triển khai</span>
              <span className="text-3xl font-bold text-blue-600 mt-1">{summary.active}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <span className="text-sm font-medium text-slate-500">Chưa mở / Khóa</span>
              <span className="text-3xl font-bold text-slate-500 mt-1">{summary.blocked}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-700">Tiến độ Web Demo</span>
              <span className="text-indigo-600 font-semibold">{summary.progress}% ({summary.accepted} / {summary.total} modules)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${summary.progress}%` }}
              />
            </div>
          </div>

          {currentModule ? (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">MODULE HIỆN TẠI</h2>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-1 flex-1">
                  <h3 className="text-xl font-bold text-indigo-900">Module {currentModule.id}</h3>
                  <p className="text-lg text-indigo-700 font-medium">{currentModule.name}</p>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold uppercase mb-1">Trạng thái</p>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium",
                        statusConfig[currentModule.status].bg,
                        statusConfig[currentModule.status].color
                      )}>
                        {React.createElement(statusConfig[currentModule.status].icon, { className: "w-4 h-4" })}
                        {statusConfig[currentModule.status].label}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-indigo-400 font-semibold uppercase mb-1">Checkpoint</p>
                    <code className="text-sm bg-white/60 px-2 py-1 rounded border border-indigo-100 text-indigo-900 font-mono">
                      {currentModule.checkpoint || 'N/A'}
                    </code>
                  </div>
                </div>

                <div className="flex-1 bg-white/50 p-4 rounded-lg border border-indigo-100">
                  <p className="text-xs text-indigo-400 font-semibold uppercase mb-2">Bước tiếp theo</p>
                  {currentModule.status === 'READY_FOR_ACCEPTANCE' ? (
                    <p className="text-sm text-indigo-800 flex items-center gap-2">
                      Kiểm tra <ArrowRight className="w-3 h-3" /> Fix nếu cần <ArrowRight className="w-3 h-3" /> Nghiệm thu <ArrowRight className="w-3 h-3" /> Checkpoint
                    </p>
                  ) : currentModule.status === 'ACTIVE' ? (
                    <p className="text-sm text-indigo-800 flex items-center gap-2">
                      Code <ArrowRight className="w-3 h-3" /> Verify <ArrowRight className="w-3 h-3" /> Chuyển Chờ nghiệm thu
                    </p>
                  ) : (
                    <p className="text-sm text-indigo-800">Theo dõi tiến độ</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-slate-600">
              <p className="text-sm font-medium">Module nghiệp vụ hiện đang tạm đóng băng trong giai đoạn UI Prototype.</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium w-16">#</th>
                    <th className="px-6 py-4 font-medium">Module</th>
                    <th className="px-6 py-4 font-medium">Trạng thái</th>
                    <th className="px-6 py-4 font-medium">Phụ thuộc</th>
                    <th className="px-6 py-4 font-medium">Checkpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {statusData.modules.map((module) => {
                    const config = statusConfig[module.status];
                    const isAccepted = module.status === 'ACCEPTED';
                    
                    return (
                      <tr key={module.id} className={cn(
                        "hover:bg-slate-50 transition-colors",
                        module.status === 'ACTIVE' && "bg-blue-50/30",
                        isAccepted && "opacity-75"
                      )}>
                        <td className="px-6 py-4 font-medium text-slate-500">{module.id}</td>
                        <td className={cn("px-6 py-4 font-medium", isAccepted ? "text-slate-700" : "text-slate-900")}>
                          {module.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2" title={isAccepted ? "Module đã được nghiệm thu. Không tự ý chỉnh sửa nếu không có Change Request." : undefined}>
                            {isAccepted && <Lock className="w-4 h-4 text-green-600" />}
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5",
                              config.bg, 
                              config.color,
                              `border-${config.color.split('-')[1]}-200`
                            )}>
                              {config.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {module.status === 'BLOCKED' && module.dependsOn.length > 0 ? (
                            <span className="text-xs">Chờ Module {module.dependsOn.join(', ')}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {module.checkpoint ? (
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                              {module.checkpoint}
                            </code>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
