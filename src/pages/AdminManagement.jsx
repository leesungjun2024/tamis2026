import React from 'react';

export default function AdminManagement({
  workgroupSearchKeyword = '', setWorkgroupSearchKeyword = () => {},
  workgroupFromDate = '', setWorkgroupFromDate = () => {},
  workgroupToDate = '', setWorkgroupToDate = () => {},
  workgroupLimitCount = 10, setWorkgroupLimitCount = () => {},
  searchedWorkgroups = [],
  
  portfolioSearchKeyword = '', setPortfolioSearchKeyword = () => {},
  portfolioFromDate = '', setPortfolioFromDate = () => {},
  portfolioToDate = '', setPortfolioToDate = () => {},
  portfolioLimitCount = 10, setPortfolioLimitCount = () => {},
  searchedPortfolios = [],
  
  trackSearchKeyword = '', setTrackSearchKeyword = () => {},
  trackFromDate = '', setTrackFromDate = () => {},
  trackToDate = '', setTrackToDate = () => {},
  trackLimitCount = 10, setTrackLimitCount = () => {},
  searchedTracks = [],

  feedbackSearchKeyword = '', setFeedbackSearchKeyword = () => {},
  feedbackFromDate = '', setFeedbackFromDate = () => {},
  feedbackToDate = '', setFeedbackToDate = () => {},
  feedbackLimitCount = 10, setFeedbackLimitCount = () => {},
  searchedFeedbacks = [],

  fetchAdminData = () => {}
}) {
  return (
    <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>⚙️ 관리 페이지 (조회/사용 여부 및 상세 정보 관리)</h2>

      {/* 1. 작업방 관리 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px' }}>📁 작업방 사용(조회) 여부 및 상세 관리</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <input type="text" placeholder="작업방 명 검색..." value={workgroupSearchKeyword} onChange={(e) => setWorkgroupSearchKeyword(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '140px' }} />
          <input type="date" value={workgroupFromDate} onChange={(e) => setWorkgroupFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <span>~</span>
          <input type="date" value={workgroupToDate} onChange={(e) => setWorkgroupToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <button onClick={() => setWorkgroupLimitCount(10)} style={{ padding: '4px 8px', background: workgroupLimitCount === 10 ? '#4f46e5' : '#f1f5f9', color: workgroupLimitCount === 10 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>10건</button>
            <button onClick={() => setWorkgroupLimitCount(50)} style={{ padding: '4px 8px', background: workgroupLimitCount === 50 ? '#4f46e5' : '#f1f5f9', color: workgroupLimitCount === 50 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>50건</button>
            <button onClick={() => setWorkgroupLimitCount(100)} style={{ padding: '4px 8px', background: workgroupLimitCount === 100 ? '#4f46e5' : '#f1f5f9', color: workgroupLimitCount === 100 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>100건</button>
          </div>
          <button onClick={fetchAdminData} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
        </div>
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>작업방 명</th>
                <th style={{ padding: '8px' }}>이메일 (소유자)</th>
                <th style={{ padding: '8px' }}>회원수</th>
                <th style={{ padding: '8px' }}>최근 트랙 등록일시</th>
                <th style={{ padding: '8px' }}>최근 피드백 등록일시</th>
                <th style={{ padding: '8px' }}>사용 여부</th>
                <th style={{ padding: '8px' }}>삭제 여부</th>
              </tr>
            </thead>
            <tbody>
              {(searchedWorkgroups || []).length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 작업방이 없습니다.</td></tr>
              ) : (
                (searchedWorkgroups || []).map((w) => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{w.workgroup_name}</td>
                    <td style={{ padding: '8px', color: '#4f46e5' }}>{w.user_email}</td>
                    <td style={{ padding: '8px' }}>{w.member_count} 명</td>
                    <td style={{ padding: '8px' }}>{w.last_track_date}</td>
                    <td style={{ padding: '8px' }}>{w.last_feedback_date}</td>
                    <td style={{ padding: '8px', color: '#15803d', fontWeight: 'bold' }}>{w.view_yn !== 'N' ? '사용중' : '중지'}</td>
                    <td style={{ padding: '8px', color: '#ef4444', fontWeight: 'bold' }}>{w.del_yn === 'Y' ? '삭제됨' : '정상'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 포트폴리오 관리 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px' }}>💼 포트폴리오 사용(조회) 여부 및 상세 관리</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <input type="text" placeholder="포트폴리오 타이틀 검색..." value={portfolioSearchKeyword} onChange={(e) => setPortfolioSearchKeyword(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '140px' }} />
          <input type="date" value={portfolioFromDate} onChange={(e) => setPortfolioFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <span>~</span>
          <input type="date" value={portfolioToDate} onChange={(e) => setPortfolioToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <button onClick={() => setPortfolioLimitCount(10)} style={{ padding: '4px 8px', background: portfolioLimitCount === 10 ? '#4f46e5' : '#f1f5f9', color: portfolioLimitCount === 10 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>10건</button>
            <button onClick={() => setPortfolioLimitCount(50)} style={{ padding: '4px 8px', background: portfolioLimitCount === 50 ? '#4f46e5' : '#f1f5f9', color: portfolioLimitCount === 50 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>50건</button>
            <button onClick={() => setPortfolioLimitCount(100)} style={{ padding: '4px 8px', background: portfolioLimitCount === 100 ? '#4f46e5' : '#f1f5f9', color: portfolioLimitCount === 100 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>100건</button>
          </div>
          <button onClick={fetchAdminData} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
        </div>
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>포트폴리오 타이틀</th>
                <th style={{ padding: '8px' }}>이메일 (소유자)</th>
                <th style={{ padding: '8px' }}>참여자수</th>
                <th style={{ padding: '8px' }}>최근 트랙 등록일시</th>
                <th style={{ padding: '8px' }}>최근 피드백 등록일시</th>
                <th style={{ padding: '8px' }}>사용 여부</th>
                <th style={{ padding: '8px' }}>삭제 여부</th>
              </tr>
            </thead>
            <tbody>
              {(searchedPortfolios || []).length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 포트폴리오가 없습니다.</td></tr>
              ) : (
                (searchedPortfolios || []).map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.title}</td>
                    <td style={{ padding: '8px', color: '#4f46e5' }}>{p.user_email}</td>
                    <td style={{ padding: '8px' }}>{p.member_count} 명</td>
                    <td style={{ padding: '8px' }}>{p.last_track_date}</td>
                    <td style={{ padding: '8px' }}>{p.last_feedback_date}</td>
                    <td style={{ padding: '8px', color: '#15803d', fontWeight: 'bold' }}>{p.view_yn !== 'N' ? '사용중' : '중지'}</td>
                    <td style={{ padding: '8px', color: '#ef4444', fontWeight: 'bold' }}>{p.del_yn === 'Y' ? '삭제됨' : '정상'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 음원(트랙) 관리 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px' }}>🎵 음원(트랙) 사용(조회) 여부 및 상세 관리</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <input type="text" placeholder="트랙 명 검색..." value={trackSearchKeyword} onChange={(e) => setTrackSearchKeyword(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '140px' }} />
          <input type="date" value={trackFromDate} onChange={(e) => setTrackFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <span>~</span>
          <input type="date" value={trackToDate} onChange={(e) => setTrackToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <button onClick={() => setTrackLimitCount(10)} style={{ padding: '4px 8px', background: trackLimitCount === 10 ? '#4f46e5' : '#f1f5f9', color: trackLimitCount === 10 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>10건</button>
            <button onClick={() => setTrackLimitCount(50)} style={{ padding: '4px 8px', background: trackLimitCount === 50 ? '#4f46e5' : '#f1f5f9', color: trackLimitCount === 50 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>50건</button>
            <button onClick={() => setTrackLimitCount(100)} style={{ padding: '4px 8px', background: trackLimitCount === 100 ? '#4f46e5' : '#f1f5f9', color: trackLimitCount === 100 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>100건</button>
          </div>
          <button onClick={fetchAdminData} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
        </div>
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>작업방/포트폴리오 명</th>
                <th style={{ padding: '8px' }}>음원(트랙) 명</th>
                <th style={{ padding: '8px' }}>등록일시</th>
                <th style={{ padding: '8px' }}>사용 여부</th>
                <th style={{ padding: '8px' }}>삭제 여부</th>
              </tr>
            </thead>
            <tbody>
              {(searchedTracks || []).length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 음원이 없습니다.</td></tr>
              ) : (
                (searchedTracks || []).map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{t.portfolio_label}</td>
                    <td style={{ padding: '8px', color: '#4f46e5' }}>{t.track_name}</td>
                    <td style={{ padding: '8px' }}>{new Date(t.created_at).toLocaleString()}</td>
                    <td style={{ padding: '8px', color: '#15803d', fontWeight: 'bold' }}>{t.view_yn !== 'N' ? '사용중' : '중지'}</td>
                    <td style={{ padding: '8px', color: '#ef4444', fontWeight: 'bold' }}>{t.del_yn === 'Y' ? '삭제됨' : '정상'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 피드백 관리 */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px' }}>💬 피드백 사용(조회) 여부 및 상세 관리</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <input type="text" placeholder="피드백 내용 검색..." value={feedbackSearchKeyword} onChange={(e) => setFeedbackSearchKeyword(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '140px' }} />
          <input type="date" value={feedbackFromDate} onChange={(e) => setFeedbackFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <span>~</span>
          <input type="date" value={feedbackToDate} onChange={(e) => setFeedbackToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <button onClick={() => setFeedbackLimitCount(10)} style={{ padding: '4px 8px', background: feedbackLimitCount === 10 ? '#4f46e5' : '#f1f5f9', color: feedbackLimitCount === 10 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>10건</button>
            <button onClick={() => setFeedbackLimitCount(50)} style={{ padding: '4px 8px', background: feedbackLimitCount === 50 ? '#4f46e5' : '#f1f5f9', color: feedbackLimitCount === 50 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>50건</button>
            <button onClick={() => setFeedbackLimitCount(100)} style={{ padding: '4px 8px', background: feedbackLimitCount === 100 ? '#4f46e5' : '#f1f5f9', color: feedbackLimitCount === 100 ? '#fff' : '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>100건</button>
          </div>
          <button onClick={fetchAdminData} style={{ padding: '6px 12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
        </div>
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>작업방 명</th>
                <th style={{ padding: '8px' }}>피드백 내용</th>
                <th style={{ padding: '8px' }}>작성자</th>
                <th style={{ padding: '8px' }}>등록일시</th>
                <th style={{ padding: '8px' }}>사용 여부</th>
                <th style={{ padding: '8px' }}>삭제 여부</th>
              </tr>
            </thead>
            <tbody>
              {(searchedFeedbacks || []).length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 피드백이 없습니다.</td></tr>
              ) : (
                (searchedFeedbacks || []).map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{f.portfolio_label}</td>
                    <td style={{ padding: '8px', color: '#334155' }}>{f.content}</td>
                    <td style={{ padding: '8px', color: '#4f46e5' }}>{f.author}</td>
                    <td style={{ padding: '8px' }}>{new Date(f.created_at).toLocaleString()}</td>
                    <td style={{ padding: '8px', color: '#15803d', fontWeight: 'bold' }}>{f.view_yn !== 'N' ? '사용중' : '중지'}</td>
                    <td style={{ padding: '8px', color: '#ef4444', fontWeight: 'bold' }}>{f.del_yn === 'Y' ? '삭제됨' : '정상'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}