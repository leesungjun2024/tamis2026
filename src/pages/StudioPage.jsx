import React from 'react';

export default function StudioPage({
  setActiveTab,
  workgroupName,
  currentVersion,
  handleAddVersion,
  waveformContainerRef,
  currentTime,
  duration,
  togglePlay,
  isPlaying,
  newCommentText,
  setNewCommentText,
  handleAddComment,
  studioSubTab,
  setStudioSubTab,
  comments,
  trackVersions,
  workgroupMembers,
  handlePublishPortfolio,
  beginStamp, // 타임스탬프 찍기 함수 연동
  activeLiveComment // 현재 시점 실시간 코멘트
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '10px 0', maxWidth: '480px', margin: '0 auto', background: '#fcfcfc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif', position: 'relative', paddingBottom: '70px' }}>
      
      {/* 1. 상단 네비게이션 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={() => setActiveTab('portfolio')} style={{ background: 'transparent', border: 'none', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#1e293b' }}>‹</button>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>작업방</h2>
        <button onClick={() => alert('링크가 복사되었습니다.')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>↗️</button>
      </div>

      {/* 2. 곡 정보 및 버전 선택 카드 */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <div style={{ width: '60px', height: '60px', background: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '11px', textAlign: 'cover' }}>
          BLUE HOUR
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WORK IN PROGRESS</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '2px 0' }}>{workgroupName || 'viva viva viva !!'}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>Work in progress · 함께 만드는 중</div>
        </div>
        <button onClick={handleAddVersion} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', color: '#334155' }}>
          {currentVersion} ›
        </button>
      </div>

      {/* 참여자 요약 및 SAMPLE 배지 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: '#64748b', padding: '0 4px' }}>
        <span>참여자 {1 + (workgroupMembers?.length || 0)}명 · 크레딧 편집</span>
        <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }}>SAMPLE</span>
      </div>

      {/* 3. 파형 재생 영역 (WaveSurfer) */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <div ref={waveformContainerRef} style={{ width: '100%', marginBottom: '10px', cursor: 'pointer' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{formatTime(currentTime)}</span>
          <button onClick={togglePlay} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isPlaying ? '⏸ 일시정지' : '▶ 파형 재생'}
          </button>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{formatTime(duration || 48)}</span>
        </div>
      </div>

      {/* 터치 가이드 및 타임스탬프 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: '#64748b', padding: '0 4px' }}>
        <span>터치로 재생 · 좌우로 밀어 이동</span>
        <button onClick={beginStamp} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
          ⏱ 타임스탬프
        </button>
      </div>

      {/* 4. 실시간 지점 코멘트 배너 */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            💬 지금 지점의 코멘트
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', cursor: 'pointer', fontWeight: '500' }}>전체 보기 ↗</span>
        </div>
        <p style={{ fontSize: '12px', color: '#334155', margin: 0 }}>
          {activeLiveComment ? `${formatTime(activeLiveComment.timestamp)} · ${activeLiveComment.author}: ${activeLiveComment.content}` : '아직 코멘트가 없는 지점이에요. 계속 들어보세요.'}
        </p>
      </div>

      {/* 5. 하위 탭 (코멘트 / 버전 / 참여자) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '14px', gap: '24px', fontSize: '13px', fontWeight: 'bold' }}>
        <span onClick={() => setStudioSubTab('comments')} style={{ paddingBottom: '8px', borderBottom: studioSubTab === 'comments' ? '2px solid #10b981' : 'none', color: studioSubTab === 'comments' ? '#10b981' : '#64748b', cursor: 'pointer' }}>
          코멘트 {comments.length}
        </span>
        <span onClick={() => setStudioSubTab('versions')} style={{ paddingBottom: '8px', borderBottom: studioSubTab === 'versions' ? '2px solid #10b981' : 'none', color: studioSubTab === 'versions' ? '#10b981' : '#64748b', cursor: 'pointer' }}>
          버전 {trackVersions.length}
        </span>
        <span onClick={() => setStudioSubTab('members')} style={{ paddingBottom: '8px', borderBottom: studioSubTab === 'members' ? '2px solid #10b981' : 'none', color: studioSubTab === 'members' ? '#10b981' : '#64748b', cursor: 'pointer' }}>
          참여자 {1 + (workgroupMembers?.length || 0)}
        </span>
      </div>

      {/* 6. 탭별 컨텐츠 (코멘트 탭 기본 표시) */}
      {studioSubTab === 'comments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* 지점 코멘트 남기기 인풋 박스 */}
          <div style={{ background: '#f0fdf4', border: '1px dashed #10b981', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="지점을 찍고 코멘트 남기기..." 
                value={newCommentText} 
                onChange={(e) => setNewCommentText(e.target.value)} 
                style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }} 
              />
              <button onClick={handleAddComment} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                등록
              </button>
            </div>
          </div>

          {/* 코멘트 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>아직 코멘트가 없습니다. 첫 아이디어를 남겨보세요!</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '22px', height: '22px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px' }}>
                        {c.author ? c.author.slice(0, 1).toUpperCase() : 'H'}
                      </span>
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.author || '하린'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>저장된 피드백</span>
                      <span style={{ fontSize: '10px', color: '#15803d', fontWeight: 'bold', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                        ▶ {formatTime(c.timestamp || c.start || 0)}
                      </span>
                    </div>
                  </div>
                  <div style={{ color: '#334155', paddingLeft: '28px' }}>{c.content || c.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {studioSubTab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '220px', overflowY: 'auto' }}>
          {trackVersions.map((v) => (
            <div key={v.id} style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#4f46e5' }}>{v.version || v.label}</strong>: {v.title || v.filename}
              </div>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{v.date || '0:48'}</span>
            </div>
          ))}
        </div>
      )}

      {studioSubTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '220px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>하린 (나)</span>
            <span style={{ color: '#64748b' }}>Songwriting · Vocal</span>
          </div>
          {workgroupMembers.map((m, idx) => (
            <div key={idx} style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold' }}>{m.member_email}</span>
              <span style={{ color: '#64748b' }}>{m.role || 'Production'}</span>
            </div>
          ))}
        </div>
      )}

      {/* 7. 포트폴리오 담기 완료 버튼 */}
      <button onClick={handlePublishPortfolio} style={{ width: '100%', padding: '12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #10b981', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textAlign: 'center', marginTop: '10px' }}>
        ✓ 작업 완료하고 포트폴리오에 담기
      </button>

      {/* 8. 하단 앱 네비게이션 탭바 (이미지 하단바 반영) */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#fff', borderTop: '1px solid #e2e8f0', padding: '10px 0', position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', color: '#64748b', cursor: 'pointer' }} onClick={() => setActiveTab('portfolio')}>
          <span>👤</span>
          <span>내 페이지</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', color: '#64748b', cursor: 'pointer' }} onClick={() => setActiveTab('explore')}>
          <span>🧭</span>
          <span>샘플 탐색</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', color: '#64748b', cursor: 'pointer' }} onClick={() => setActiveTab('messages')}>
          <span>💬</span>
          <span>대화 체험</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '10px', color: '#15803d', fontWeight: 'bold', cursor: 'pointer' }}>
          <span>💼</span>
          <span>작업방 체험</span>
        </div>
      </div>

    </div>
  );
}