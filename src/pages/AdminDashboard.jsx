import React from 'react';

export default function AdminDashboard({
  dashboardFilterType, setDashboardFilterType,
  fromDate, setFromDate,
  toDate, setToDate,
  activeUsersList,
  selectedActiveUser, setSelectedActiveUser,
  handleForceLogoutUser,
  allWorkgroupsAdmin,
  allPortfoliosAdmin,
  allFeedbacksAdmin,
  loginLogs,
  filteredWorkgroups,
  filteredPortfolios,
  filteredFeedbacks,
  filteredLogs,
  timeSeriesData,
  maxTimeSeriesVal
}) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>📊 관리자 대시보드 상세 통계</h2>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => { setDashboardFilterType('today'); setFromDate(''); setToDate(''); }} style={{ padding: '6px 10px', background: !fromDate && dashboardFilterType === 'today' ? '#4f46e5' : '#fff', color: !fromDate && dashboardFilterType === 'today' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>금일</button>
          <button onClick={() => { setDashboardFilterType('yesterday'); setFromDate(''); setToDate(''); }} style={{ padding: '6px 10px', background: !fromDate && dashboardFilterType === 'yesterday' ? '#4f46e5' : '#fff', color: !fromDate && dashboardFilterType === 'yesterday' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>어제</button>
          <button onClick={() => { setDashboardFilterType('week'); setFromDate(''); setToDate(''); }} style={{ padding: '6px 10px', background: !fromDate && dashboardFilterType === 'week' ? '#4f46e5' : '#fff', color: !fromDate && dashboardFilterType === 'week' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>최근 일주일</button>
          <button onClick={() => { setDashboardFilterType('month'); setFromDate(''); setToDate(''); }} style={{ padding: '6px 10px', background: !fromDate && dashboardFilterType === 'month' ? '#4f46e5' : '#fff', color: !fromDate && dashboardFilterType === 'month' ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>최근 한달</button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '6px', fontSize: '11px' }}>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
            <span>~</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          </div>
        </div>
      </div>

      {/* 현재 접속자 통계 및 상세 조회 패널 */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', border: '1px solid #15803d' }}></span>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              현재 접속자 통계 및 상세 조회 ({activeUsersList.length}명 접속 중)
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>유저를 클릭하면 상세 정보를 조회합니다</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedActiveUser ? '3fr 2fr' : '1fr', gap: '16px', alignItems: 'start' }}>
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', maxHeight: '380px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 }}>
                  <th style={{ padding: '8px' }}>사용자명 (이메일)</th>
                  <th style={{ padding: '8px' }}>로그인 시간</th>
                  <th style={{ padding: '8px' }}>접속 상태 / 강제종료</th>
                </tr>
              </thead>
              <tbody>
                {activeUsersList.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>현재 접속 중인 사용자가 없습니다.</td></tr>
                ) : (
                  activeUsersList.map((log) => {
                    const loginDate = new Date(log.login_time);
                    const diffMins = Math.floor((new Date() - loginDate) / (1000 * 60));
                    const isSelected = selectedActiveUser?.id === log.id;

                    return (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedActiveUser(log)}
                        style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', background: isSelected ? '#e0e7ff' : 'transparent' }}
                      >
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#4f46e5' }}>{log.user_email}</td>
                        <td style={{ padding: '8px' }}>{loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            ({diffMins}분) 접속 중
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleForceLogoutUser(log.id, log.user_email); }}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            강제종료
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {selectedActiveUser && (
            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', position: 'relative' }}>
              <button 
                onClick={() => setSelectedActiveUser(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                닫기 ✕
              </button>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                👤 로그인 유저 상세 정보
              </h4>
              <div style={{ fontSize: '12px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>사용자 이메일:</strong> <span style={{ color: '#4f46e5' }}>{selectedActiveUser.user_email}</span></div>
                <div><strong>활동(접속) 시간:</strong> {Math.floor((new Date() - new Date(selectedActiveUser.login_time)) / (1000 * 60))}분 (시작: {new Date(selectedActiveUser.login_time).toLocaleString()})</div>
                <div><strong>최근 접속 IP / 위치:</strong> {selectedActiveUser.ip_address || '211.235.90.40'} / {selectedActiveUser.location || '대한민국 (Seoul)'}</div>
                <div style={{ wordBreak: 'break-all' }}><strong>접속 기기(Device):</strong> <span style={{ fontSize: '11px', color: '#64748b' }}>{selectedActiveUser.device || 'Mozilla/5.0'}</span></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}>
                <span>작업방 보유 수: <strong style={{ color: '#4f46e5' }}>{allWorkgroupsAdmin.filter(w => w.user_email === selectedActiveUser.user_email).length}개</strong></span>
                <span>포트폴리오 보유 수: <strong style={{ color: '#3b82f6' }}>{allPortfoliosAdmin.filter(p => p.user_email === selectedActiveUser.user_email).length}개</strong></span>
                <span style={{ gridColumn: 'span 2' }}>작성한 피드백 수: <strong style={{ color: '#10b981' }}>{allFeedbacksAdmin.filter(f => f.author === selectedActiveUser.user_email.split('@')[0]).length}건</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>작업방 (기간내 / 전체)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5', marginTop: '6px' }}>
            {filteredWorkgroups.length} 개 <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ {allWorkgroupsAdmin.length} 개</span>
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>포트폴리오 (기간내 / 전체)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', marginTop: '6px' }}>
            {filteredPortfolios.length} 개 <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ {allPortfoliosAdmin.length} 개</span>
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>피드백 (기간내 / 전체)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '6px' }}>
            {filteredFeedbacks.length} 건 <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ {allFeedbacksAdmin.filter(f => f.del_yn !== 'Y').length} 건</span>
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>로그인 이력 (전체)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', marginTop: '6px' }}>
            {filteredLogs.length} 건 <span style={{ fontSize: '13px', color: '#94a3b8' }}>/ {loginLogs.length} 건</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: 0 }}>📈 1. 시계열 현황 (작업방 / 포트폴리오 / 피드백수)</h3>
        </div>
        <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '24px', borderBottom: '1px solid #cbd5e1', paddingLeft: '8px', paddingRight: '8px', overflowX: 'auto' }}>
          {timeSeriesData.map((stat, idx) => {
            const wHeight = Math.round((stat.wCount / maxTimeSeriesVal) * 120);
            const pHeight = Math.round((stat.pCount / maxTimeSeriesVal) * 120);
            const fHeight = Math.round((stat.fCount / maxTimeSeriesVal) * 120);

            return (
              <div key={idx} style={{ flex: 1, minWidth: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '8px', color: '#334155', marginBottom: '2px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {stat.wCount}/{stat.pCount}/{stat.fCount}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', width: '100%', height: '130px', justifyContent: 'center' }}>
                  <div style={{ width: '28%', background: '#4f46e5', height: `${Math.max(wHeight, 4)}px`, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ width: '28%', background: '#3b82f6', height: `${Math.max(pHeight, 4)}px`, borderRadius: '2px 2px 0 0' }} />
                  <div style={{ width: '28%', background: '#f59e0b', height: `${Math.max(fHeight, 4)}px`, borderRadius: '2px 2px 0 0' }} />
                </div>
                <span style={{ fontSize: '9px', color: '#475569', marginTop: '6px', whiteSpace: 'nowrap' }}>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>🎵 2. 콘텐츠 및 피드백 지표</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <span>기간 내 작업방 수</span>
              <strong style={{ color: '#4f46e5' }}>{filteredWorkgroups.length} 개</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <span>기간 내 포트폴리오 수</span>
              <strong style={{ color: '#3b82f6' }}>{filteredPortfolios.length} 개</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <span>기간 내 피드백 수</span>
              <strong style={{ color: '#10b981' }}>{filteredFeedbacks.length} 건</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <span>기간 내 피드백 회원수</span>
              <strong style={{ color: '#f59e0b' }}>{new Set(filteredFeedbacks.map(f => f.author)).size} 명</strong>
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>🌍 3. 로그인 지역 및 접속 분포</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', maxHeight: '210px', overflowY: 'auto' }}>
            {Object.entries(
              loginLogs.reduce((acc, log) => {
                const loc = log.location || 'South Korea (Seoul)';
                acc[loc] = (acc[loc] || 0) + 1;
                return acc;
              }, {})
            ).map(([loc, count], idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <span>📍 {loc}</span>
                <strong style={{ color: '#4f46e5' }}>{count} 명</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}