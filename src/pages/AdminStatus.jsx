import React from 'react';

export default function AdminStatus({
  adminList,
  newAdminEmail,
  setNewAdminEmail,
  newAdminName,
  setNewAdminName,
  newAdminRole,
  setNewAdminRole,
  handleAddAdminDB,
  handleDeleteAdminDB,
  loginLogs,
  searchedLoginLogs,
  activeUsersList,
  selectedActiveUser,
  setSelectedActiveUser,
  loginSearchKeyword,
  setLoginSearchKeyword,
  loginLocationKeyword,
  setLoginLocationKeyword,
  loginFromDate,
  setLoginFromDate,
  loginToDate,
  setLoginToDate,
  loginLimitCount,
  setLoginLimitCount,
  fetchAdminData,
  handleForceLogoutUser,
  allWorkgroupsAdmin,
  allPortfoliosAdmin,
  allFeedbacksAdmin
}) {
  return (
    <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>📋 관리자 현황 관리 (시스템 접속 및 권한 제어)</h2>

      {/* 1. 관리자 목록 및 등록 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px' }}>👑 관리자 목록 및 권한 등급 (DB 연동 & 기능별 세부 권한 확장)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>신규 관리자 DB 등록</h4>
            <form onSubmit={handleAddAdminDB} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="email" placeholder="이메일 입력" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} required />
              <input type="text" placeholder="성명/직책" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} required />
              <select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}>
                <option value="포트폴리오 관리자 (최대 10명)">포트폴리오 관리자 (최대 10명)</option>
                <option value="시스템 관리자 (최대 3명)">시스템 관리자 (최대 3명)</option>
              </select>
              <button type="submit" style={{ padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>관리자 DB 추가 ➕</button>
            </form>
          </div>

          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>성명</th>
                  <th style={{ padding: '8px' }}>이메일</th>
                  <th style={{ padding: '8px' }}>권한 등급 / 세부 권한</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>관리 (수정/해제)</th>
                </tr>
              </thead>
              <tbody>
                {adminList.map((adm) => (
                  <tr key={adm.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{adm.name}</td>
                    <td style={{ padding: '8px', color: '#4f46e5' }}>{adm.email}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>{adm.role}</span>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>📁 포트폴리오:all | 🎵 음원:all | 💬 피드백:all</div>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button onClick={() => alert('권한 수정 모달')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>수정</button>
                      <button onClick={() => handleDeleteAdminDB(adm.id, adm.email)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>해제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. 전체 로그인 이력 및 현재 접속자 현황 포틀릿 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', border: '1px solid #15803d' }}></span>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              전체 로그인 이력 및 현재 접속자 현황 ({activeUsersList.length}명 접속 중)
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>유저를 클릭하면 상세 정보를 조회합니다</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <input 
            type="text" 
            placeholder="🔍 이메일/기기 검색..." 
            value={loginSearchKeyword} 
            onChange={(e) => setLoginSearchKeyword(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '160px' }} 
          />
          <input 
            type="text" 
            placeholder="📍 지역 필터 (예: Seoul)..." 
            value={loginLocationKeyword} 
            onChange={(e) => setLoginLocationKeyword(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: '150px' }} 
          />
          <input type="date" value={loginFromDate} onChange={(e) => setLoginFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <span>~</span>
          <input type="date" value={loginToDate} onChange={(e) => setLoginToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />

          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', marginRight: '4px' }}>조회:</span>
            <button onClick={() => setLoginLimitCount(10)} style={{ padding: '4px 8px', background: loginLimitCount === 10 ? '#4f46e5' : '#f1f5f9', color: loginLimitCount === 10 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>10건</button>
            <button onClick={() => setLoginLimitCount(50)} style={{ padding: '4px 8px', background: loginLimitCount === 50 ? '#4f46e5' : '#f1f5f9', color: loginLimitCount === 50 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>50건</button>
            <button onClick={() => setLoginLimitCount(100)} style={{ padding: '4px 8px', background: loginLimitCount === 100 ? '#4f46e5' : '#f1f5f9', color: loginLimitCount === 100 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>100건</button>
          </div>
          <button onClick={fetchAdminData} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedActiveUser ? '3fr 2fr' : '1fr', gap: '16px', alignItems: 'start' }}>
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 }}>
                  <th style={{ padding: '8px' }}>사용자명 (이메일)</th>
                  <th style={{ padding: '8px' }}>로그인 시간</th>
                  <th style={{ padding: '8px' }}>접속 상태 / 강제종료</th>
                </tr>
              </thead>
              <tbody>
                {searchedLoginLogs.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 로그인 이력이 없습니다.</td></tr>
                ) : (
                  searchedLoginLogs.map((log) => {
                    const loginDate = new Date(log.login_time);
                    const diffMins = Math.floor((new Date() - loginDate) / (1000 * 60));
                    const isActive = !log.logout_time;
                    const isSelected = selectedActiveUser?.id === log.id;

                    return (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedActiveUser(log)}
                        style={{ borderBottom: '1px solid #cbd5e1', cursor: 'pointer', background: isSelected ? '#e0e7ff' : 'transparent' }}
                      >
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#4f46e5' }}>{log.user_email}</td>
                        <td style={{ padding: '8px' }}>{loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                        <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: isActive ? '#dcfce7' : '#f1f5f9', color: isActive ? '#15803d' : '#64748b', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                            ({diffMins}분) {isActive ? '접속 중' : '종료됨'}
                          </span>
                          {isActive && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleForceLogoutUser(log.id, log.user_email); }}
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              강제종료
                            </button>
                          )}
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
    </div>
  );
}