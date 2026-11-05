import React, { useState, useEffect, useRef } from 'react';

export default function StudioPage({
  currentRoom,
  roomComments,
  versionFor,
  onBack,
  onShare,
  onPublish,
  onAddVersion,
  onAddComment,
  onResolveComment,
  onAddReply,
  onUpdateCredits,
  supabaseClient
}) {
  const [activeSubTab, setActiveSubTab] = useState('comments');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isStamping, setIsStamping] = useState(false);
  const [stampTime, setStampTime] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [memberFieldsList, setMemberFieldsList] = useState([]);
  
  const audioRef = useRef(null);
  const waveformRef = useRef(null);

  if (!currentRoom) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>선택된 작업방이 없습니다.</p>
        <button onClick={onBack} style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          작업방 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const currentVer = versionFor ? versionFor(currentRoom) : currentRoom.versions?.[0];
  const comments = roomComments ? roomComments(currentRoom) : (currentRoom.comments || []);
  const duration = currentRoom.duration || 48;

  // 오디오 및 파형 초기화
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // 파형 그리기 및 클릭 제어
  useEffect(() => {
    const waveEl = waveformRef.current;
    if (!waveEl) return;

    const peaks = Array.from({ length: 64 }, (_, i) => 0.14 + 0.65 * Math.abs(Math.sin(i * 1.7)));
    const progress = isStamping ? stampTime / duration : currentTime / duration;

    waveEl.innerHTML = peaks.map((v, i) => `
      <span style="flex:1; background:${i / peaks.length < progress ? '#10b981' : '#cbd5e1'}; height:${Math.max(8, v * 50)}px; border-radius:2px; display:inline-block; margin:0 1px;"></span>
    `).join('');
  }, [currentTime, stampTime, isStamping, duration]);

  const togglePlayAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        if (!audio.src || audio.src === window.location.href) {
          audio.src = currentVer?.fileUrl || 'https://www.mfiles.co.uk/mp3-downloads/brahms-lullaby.mp3';
        }
        await audio.play();
      } catch (err) {
        console.warn('재생 실패:', err);
      }
    }
  };

  const handleWaveClick = (e) => {
    const waveEl = waveformRef.current;
    if (!waveEl) return;
    const rect = waveEl.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;

    if (isStamping) {
      setStampTime(targetTime);
    } else {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    }
  };

  const startStamping = () => {
    const audio = audioRef.current;
    if (audio) audio.pause();
    setIsStamping(true);
    setStampTime(currentTime);
    setActiveSubTab('comments');
  };

  const formatTime = (secs) => {
    const m = Math.floor((secs || 0) / 60);
    const s = Math.floor((secs || 0) % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fcfcfc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', fontFamily: 'sans-serif', position: 'relative', paddingBottom: '70px' }}>
      
      <audio ref={audioRef} preload="metadata" />

      {/* 1. 상단 툴바 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#1e293b' }}>‹</button>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>작업방</h2>
        <button onClick={onShare} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px' }}>↗️</button>
      </div>

      {/* 2. 곡 정보 및 버전 선택 카드 */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <div style={{ width: '60px', height: '60px', background: '#1e293b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>
          MUSIC
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{currentRoom.status === 'done' ? 'WORK COMPLETED' : 'WORK IN PROGRESS'}</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e293b', margin: '2px 0' }}>{currentRoom.title}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{currentRoom.genre || 'Work in progress'} · 함께 만드는 중</div>
        </div>
        <button onClick={onAddVersion} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
          {currentVer?.label || 'v1'} ›
        </button>
      </div>

      {/* 참여자 요약 및 SAMPLE 배지 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: '#64748b', padding: '0 4px' }}>
        <span>참여자 {currentRoom.people?.length || 1}명 · 크레딧 편집</span>
        <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }}>{currentRoom.localFile ? '내 MP3' : 'SAMPLE'}</span>
      </div>

      {/* 3. 파형 재생 영역 */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <div ref={waveformRef} onClick={handleWaveClick} style={{ width: '100%', height: '50px', display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{formatTime(isStamping ? stampTime : currentTime)}</span>
          <button onClick={togglePlayAudio} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            {isPlaying ? '⏸ 일시정지' : '▶ 파형 재생'}
          </button>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 타임스탬프 가이드 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: '#64748b', padding: '0 4px' }}>
        <span>터치로 재생 · 좌우로 밀어 이동</span>
        <button onClick={startStamping} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⏱ 타임스탬프
        </button>
      </div>

      {/* 타임스탬프 설정 모드 UI */}
      {isStamping && (
        <div style={{ background: '#f0fdf4', border: '1px solid #10b981', padding: '12px', borderRadius: '12px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>
            📍 선택한 지점: {formatTime(stampTime)}
          </span>
          <div>
            <button onClick={() => { setIsStamping(false); setActiveSubTab('comments'); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginRight: '6px' }}>확정</button>
            <button onClick={() => setIsStamping(false)} style={{ background: '#e2e8f0', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>취소</button>
          </div>
        </div>
      )}

      {/* 4. 서브 탭 (코멘트 / 버전 / 참여자) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '14px', gap: '24px', fontSize: '13px', fontWeight: 'bold' }}>
        <span onClick={() => setActiveSubTab('comments')} style={{ paddingBottom: '8px', borderBottom: activeSubTab === 'comments' ? '2px solid #10b981' : 'none', color: activeSubTab === 'comments' ? '#10b981' : '#64748b', cursor: 'pointer' }}>
          코멘트 {comments.length}
        </span>
        <span onClick={() => setActiveSubTab('versions')} style={{ paddingBottom: '8px', borderBottom: activeSubTab === 'versions' ? '2px solid #10b981' : 'none', color: activeSubTab === 'versions' ? '#10b981' : '#64748b', cursor: 'pointer' }}>
          버전 {currentRoom.versions?.length || 1}
        </span>
        <span onClick={() => setActiveSubTab('credits')} style={{ paddingBottom: '8px', borderBottom: activeSubTab === 'credits' ? '2px solid #10b981' : 'none', color: activeSubTab === 'credits' ? '#10b981' : '#64748b', cursor: 'pointer' }}>
          참여자 {currentRoom.people?.length || 1}
        </span>
      </div>

      {/* 5. 탭별 콘텐츠 */}
      {activeSubTab === 'comments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {/* 코멘트 작성 폼 */}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!commentText.trim()) return;
            if (onAddComment) {
              onAddComment(currentRoom, isStamping ? stampTime : currentTime, commentText);
            }
            setCommentText('');
            setIsStamping(false);
          }} style={{ background: '#f0fdf4', border: '1px dashed #10b981', padding: '12px', borderRadius: '12px' }}>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 'bold', marginBottom: '6px' }}>
              📍 {formatTime(isStamping ? stampTime : currentTime)} 지점에 코멘트 남기기
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="이 순간, 어떤 소리가 들리나요?" 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)} 
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }} 
              />
              <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                남기기
              </button>
            </div>
          </form>

          {/* 코멘트 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>아직 이 버전의 코멘트가 없어요. 타임스탬프로 첫 아이디어를 남겨 주세요.</div>
            ) : (
              comments.map((c, i) => {
                const cTime = Number(c.at ?? c.start ?? c.start_time) || 0;
                return (
                  <div key={c.id || i} style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.name || c.author || '익명'}</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button type="button" onClick={() => {
                          const audio = audioRef.current;
                          if (audio) { audio.currentTime = cTime; audio.play(); }
                        }} style={{ background: '#dcfce7', color: '#15803d', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                          ▶ {formatTime(cTime)}
                        </button>
                        {onResolveComment && (
                          <button type="button" onClick={() => onResolveComment(currentRoom, c.id)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '10px', cursor: 'pointer' }}>
                            {c.resolved ? '✓ 해결됨' : '해결'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ color: '#334155', marginBottom: '6px' }}>{c.text || c.content}</div>
                    
                    {/* 답글 표시 영역 */}
                    {c.replies && c.replies.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', marginTop: '4px', fontSize: '11px' }}>
                        {c.replies.map((rep, rIdx) => (
                          <div key={rIdx}><b>{rep.name}</b>: {rep.text}</div>
                        ))}
                      </div>
                    )}

                    {/* 답글 입력 폼 */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <input 
                        type="text" 
                        placeholder="답글 달기..." 
                        value={replyTexts[c.id] || ''} 
                        onChange={(e) => setReplyTexts({ ...replyTexts, [c.id]: e.target.value })}
                        style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }}
                      />
                      <button type="button" onClick={() => {
                        const txt = replyTexts[c.id];
                        if (!txt) return;
                        if (onAddReply) onAddReply(currentRoom, c.id, txt);
                        setReplyTexts({ ...replyTexts, [c.id]: '' });
                      }} style={{ background: '#334155', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                        등록
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'versions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
          {(currentRoom.versions || []).map((v) => (
            <div key={v.id} style={{ background: '#fff', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#10b981' }}>{v.label}</strong>: {v.filename || 'audio.mp3'}
              </div>
              <span style={{ color: '#64748b', fontSize: '11px' }}>{formatTime(v.duration || 48)}</span>
            </div>
          ))}
          <button onClick={onAddVersion} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            + 새 버전 올리기
          </button>
        </div>
      )}

      {activeSubTab === 'credits' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
          {(currentRoom.credits || []).map((c, idx) => (
            <div key={idx} style={{ background: '#fff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.name}</span>
              <span style={{ color: '#64748b' }}>{c.role || '포지션 미지정'}</span>
            </div>
          ))}
          <button onClick={() => {
            const newName = prompt('참여자 이름을 입력하세요:');
            if (newName && onUpdateCredits) {
              const updated = [...(currentRoom.credits || []), { name: newName, role: 'Vocal · Topline' }];
              onUpdateCredits(currentRoom, updated);
            }
          }} style={{ width: '100%', padding: '10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            + 참여자 추가
          </button>
        </div>
      )}

      {/* 6. 포트폴리오 완료 버튼 */}
      <button onClick={onPublish} style={{ width: '100%', padding: '12px', background: '#f0fdf4', color: '#15803d', border: '1px solid #10b981', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', textAlign: 'center', marginTop: '10px' }}>
        ✓ 작업 완료하고 포트폴리오에 담기
      </button>

    </div>
  );
}