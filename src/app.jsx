import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { supabase } from './services/supabaseClient'; 

// 분리된 페이지 컴포넌트 임포트
import AdminDashboard from './pages/AdminDashboard';
import AdminManagement from './pages/AdminManagement';
import AdminStatus from './pages/AdminStatus';
import StudioPage from './pages/StudioPage';

export default function App() {
  // 1. 인증(Login) 상태 
  const [user, setUser] = useState(null);   
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentLogIdRef = useRef(null);

  // 2. 탭 관리 상태 ('portfolio' | 'studio' | 'admin_dashboard' | 'admin_management' | 'admin_status')
  const [activeTab, setActiveTab] = useState('portfolio');
  const [myWorkgroups, setMyWorkgroups] = useState([]);
  const [currentWorkgroupId, setCurrentWorkgroupId] = useState(null);
  const [workgroupName, setWorkgroupName] = useState('새 작업방');
  const [workgroupOwnerEmail, setWorkgroupOwnerEmail] = useState(''); 
  const [workgroupMembers, setWorkgroupMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');

  // 스튜디오 전용 내부 탭 ('comments' | 'versions' | 'members')
  const [studioSubTab, setStudioSubTab] = useState('comments');
  const [trackVersions, setTrackVersions] = useState([
    { id: 1, version: 'v1', title: 'viva viva viva !!', duration: '0:48', date: '2026-11-04' }
  ]);
  const [currentVersion, setCurrentVersion] = useState('v1');

  // 3. 관리자 전용 데이터 및 세분화된 대시보드 필터 상태
  const [allWorkgroupsAdmin, setAllWorkgroupsAdmin] = useState([]);
  const [allPortfoliosAdmin, setAllPortfoliosAdmin] = useState([]);
  const [allTracksAdmin, setAllTracksAdmin] = useState([]); 
  const [allFeedbacksAdmin, setAllFeedbacksAdmin] = useState([]);
  const [loginLogs, setLoginLogs] = useState([]);
  
  const [dashboardFilterType, setDashboardFilterType] = useState('week'); 
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // 현재 접속자 및 로그인 이력 상세 조회를 위한 선택된 유저 상태
  const [selectedActiveUser, setSelectedActiveUser] = useState(null);

  // 4. Supabase DB 연동 관리자 현황 관리 상태
  const [adminList, setAdminList] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('포트폴리오 관리자 (최대 10명)');

  // 5. 검색, 위치, 기간 및 [10/50/100건] 제한 상태
  const [loginSearchKeyword, setLoginSearchKeyword] = useState('');
  const [loginLocationKeyword, setLoginLocationKeyword] = useState('');
  const [loginFromDate, setLoginFromDate] = useState('');
  const [loginToDate, setLoginToDate] = useState('');
  const [loginLimitCount, setLoginLimitCount] = useState(10);

  const [workgroupSearchKeyword, setWorkgroupSearchKeyword] = useState('');
  const [workgroupFromDate, setWorkgroupFromDate] = useState('');
  const [workgroupToDate, setWorkgroupToDate] = useState('');
  const [workgroupLimitCount, setWorkgroupLimitCount] = useState(10);

  const [portfolioSearchKeyword, setPortfolioSearchKeyword] = useState('');
  const [portfolioFromDate, setPortfolioFromDate] = useState('');
  const [portfolioToDate, setPortfolioToDate] = useState('');
  const [portfolioLimitCount, setPortfolioLimitCount] = useState(10);

  const [trackSearchKeyword, setTrackSearchKeyword] = useState('');
  const [trackFromDate, setTrackFromDate] = useState('');
  const [trackToDate, setTrackToDate] = useState('');
  const [trackLimitCount, setTrackLimitCount] = useState(10);

  const [feedbackSearchKeyword, setFeedbackSearchKeyword] = useState('');
  const [feedbackFromDate, setFeedbackFromDate] = useState('');
  const [feedbackToDate, setFeedbackToDate] = useState('');
  const [feedbackLimitCount, setFeedbackLimitCount] = useState(10);

  // 6. 오디오 재생 및 트랙/피드백 상태
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('사용자');

  const wavesurferRef = useRef(null);
  const waveformContainerRef = useRef(null);

  // 관리자 판별 및 역할 분기
  const checkIsAdmin = (userEmail) => {
    if (!userEmail) return false;
    const found = adminList.find(a => a.email.toLowerCase() === userEmail.toLowerCase());
    if (found) return true;
    return userEmail === 'admin@admin.com' || userEmail.startsWith('admin') || userEmail === 'krsungjun@gmail.com' || userEmail === 'babadol@naver.com';
  };

  const currentAdminInfo = user ? adminList.find(a => a.email.toLowerCase() === user.email.toLowerCase()) : null;
  
  const isSystemAdmin = user && (
    user.email === 'admin@admin.com' || 
    user.email === 'krsungjun@gmail.com' || 
    currentAdminInfo?.role?.includes('시스템') || 
    currentAdminInfo?.role === 'system_admin'
  );

  const isPortfolioAdmin = user && (
    checkIsAdmin(user.email) && !isSystemAdmin
  );

  const fetchAdminsFromDB = async () => {
    try {
      const { data, error } = await supabase.from('admins').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        setAdminList(data);
      } else {
        setAdminList([
          { id: 1, email: 'admin@admin.com', name: '최고관리자', role: '시스템 관리자', permissions: { portfolio: 'all', track: 'all', feedback: 'all' } },
          { id: 2, email: 'krsungjun@gmail.com', name: '이성준 (시스템총괄)', role: '시스템 관리자', permissions: { portfolio: 'all', track: 'all', feedback: 'all' } },
          { id: 3, email: 'babadol@naver.com', name: '타미관리자', role: '포트폴리오 관리자', permissions: { portfolio: 'all', track: 'all', feedback: 'all' } }
        ]);
      }
    } catch (err) {
      console.error('관리자 목록 조회 오류:', err);
    }
  };

  const handleAddAdminDB = async (e) => {
    e.preventDefault();
    if (!newAdminEmail || !newAdminName) {
      alert('관리자 이메일과 성명/직책을 입력해주세요.');
      return;
    }

    try {
      const newAdminObj = {
        email: newAdminEmail,
        name: newAdminName,
        role: newAdminRole.includes('시스템') ? '시스템 관리자' : '포트폴리오 관리자',
        permissions: { portfolio: 'all', track: 'all', feedback: 'all' }
      };

      const { error } = await supabase.from('admins').insert([newAdminObj]);
      if (error) {
        setAdminList(prev => [...prev, { id: Date.now(), ...newAdminObj }]);
      }

      alert('신규 관리자가 성공적으로 등록되었습니다.');
      setNewAdminEmail('');
      setNewAdminName('');
      fetchAdminData();
    } catch (err) {
      console.error('관리자 추가 오류:', err);
    }
  };

  const handleDeleteAdminDB = async (adminId, adminEmail) => {
    if (!window.confirm(`${adminEmail} 관리자를 해제하시겠습니까?`)) return;
    try {
      await supabase.from('admins').delete().eq('id', adminId);
      setAdminList(prev => prev.filter(a => a.id !== adminId));
      alert('관리자 권한이 해제되었습니다.');
      fetchAdminData();
    } catch (err) {
      console.error('관리자 삭제 오류:', err);
    }
  };

  const recordLoginLog = async (userEmail) => {
    try {
      let ip = '211.235.90.40';
      let location = '대한민국 (Seoul)';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;

        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        const geoData = await geoRes.json();
        if (geoData && geoData.country_name) {
          location = `${geoData.country_name} (${geoData.region || 'Unknown'})`;
        }
      } catch (e) {
        console.warn('IP/위치 조회 예외:', e);
      }

      const device = navigator.userAgent;
      const { data, error } = await supabase
        .from('login_logs')
        .insert([{ user_email: userEmail, ip_address: ip, location: location, device: device }])
        .select()
        .single();

      if (!error && data) {
        currentLogIdRef.current = data.id;
      }
    } catch (err) {
      console.error('로그인 기록 저장 오류:', err);
    }
  };

  const recordLogoutLog = async () => {
    if (currentLogIdRef.current) {
      await supabase
        .from('login_logs')
        .update({ logout_time: new Date().toISOString() })
        .eq('id', currentLogIdRef.current);
      currentLogIdRef.current = null;
    }
  };

  useEffect(() => {
    fetchAdminsFromDB();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      if (currentUser) {
        const adminCheck = checkIsAdmin(currentUser.email);
        setIsAdmin(adminCheck);
        setUser(currentUser);
        fetchMyWorkgroups(currentUser, adminCheck);
        setAuthorName(currentUser.email.split('@')[0]);

        if (event === 'SIGNED_IN') {
          await recordLoginLog(currentUser.email);
        }

        if (adminCheck) fetchAdminData();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // WaveSurfer 스튜디오 오디오 파형 초기화
  useEffect(() => {
    if (activeTab === 'studio' && waveformContainerRef.current) {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }

      const ws = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: '#cbd5e1',
        progressColor: '#10b981',
        cursorColor: '#10b981',
        barWidth: 3,
        barRadius: 3,
        height: 80,
        normalize: true,
        url: 'https://www.mfiles.co.uk/mp3-downloads/brahms-lullaby.mp3'
      });

      ws.on('ready', () => {
        setDuration(ws.getDuration());
      });

      ws.on('audioprocess', () => {
        setCurrentTime(ws.getCurrentTime());
      });

      ws.on('finish', () => {
        setIsPlaying(false);
      });

      wavesurferRef.current = ws;

      return () => {
        ws.destroy();
      };
    }
  }, [activeTab, currentWorkgroupId]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('회원가입 성공! 로그인해주세요.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
        return;
      }
    }
  };

  const handleLogout = async () => {
    await recordLogoutLog();
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setCurrentWorkgroupId(null);
    setTracks([]);
    setComments([]);
    setWorkgroupMembers([]);
    setActiveTab('portfolio');
  };

  const handleForceLogoutUser = async (logId, userEmail) => {
    if (!window.confirm(`${userEmail} 사용자의 접속을 강제 종료하시겠습니까?`)) return;
    try {
      await supabase
        .from('login_logs')
        .update({ logout_time: new Date().toISOString() })
        .eq('id', logId);
      alert('성공적으로 강제 종료되었습니다.');
      fetchAdminData();
      if (selectedActiveUser?.id === logId) setSelectedActiveUser(null);
    } catch (err) {
      console.error('강제 종료 처리 오류:', err);
    }
  };

  const fetchMyWorkgroups = async (userObj, adminFlag) => {
    if (!userObj) return;

    try {
      let rawWorkgroups = [];

      if (adminFlag) {
        const { data, error } = await supabase
          .from('workgroups')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) rawWorkgroups = data.filter(w => w.del_yn !== 'Y');
      } else {
        const { data: myOwnedData, error: myError } = await supabase
          .from('workgroups')
          .select('*')
          .eq('user_id', userObj.id);

        if (myError) throw myError;

        const { data: invitedMemberData, error: memberError } = await supabase
          .from('workgroup_members')
          .select('workgroup_id')
          .eq('member_email', userObj.email);

        if (memberError) throw memberError;

        const invitedIds = (invitedMemberData || []).map((m) => m.workgroup_id);

        let invitedWorkgroups = [];
        if (invitedIds.length > 0) {
          const { data: invitedData, error: invitedError } = await supabase
            .from('workgroups')
            .select('*')
            .in('id', invitedIds);

          if (!invitedError && invitedData) {
            invitedWorkgroups = invitedData;
          }
        }

        const combinedMap = new Map();
        [...(myOwnedData || []), ...invitedWorkgroups].forEach((item) => {
          if (item.view_yn !== 'N' && item.del_yn !== 'Y') {
            combinedMap.set(item.id, item);
          }
        });

        rawWorkgroups = Array.from(combinedMap.values());
      }

      const workgroupIds = rawWorkgroups.map((w) => w.id);
      if (workgroupIds.length === 0) {
        setMyWorkgroups([]);
        return;
      }

      const { data: membersData } = await supabase
        .from('workgroup_members')
        .select('*')
        .in('workgroup_id', workgroupIds);

      const { data: feedbacksData } = await supabase
        .from('feedbacks')
        .select('id, workgroup_id, del_yn')
        .in('workgroup_id', workgroupIds);

      const validFeedbacks = (feedbacksData || []).filter(f => f.del_yn !== 'Y');

      const finalWorkgroups = rawWorkgroups.map((w) => {
        const members = (membersData || []).filter((m) => m.workgroup_id === w.id);
        const feedbackCount = validFeedbacks.filter((f) => f.workgroup_id === w.id).length;
        const ownerEmail = w.user_email || userObj.email || '알 수 없음';

        return {
          ...w,
          portfolio_name: w.workgroup_name,
          user_email: ownerEmail,
          invited_members: members.map((m) => m.member_email),
          feedback_count: feedbackCount
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setMyWorkgroups(finalWorkgroups);
    } catch (err) {
      console.error('작업방 목록 조회 오류:', err);
    }
  };

  const fetchAdminData = async () => {
    fetchAdminsFromDB();
    
    // 1. 각 테이블별로 독립적으로 데이터 조회 (조인 의존성 및 스키마 불일치 에러 원천 차단)
    const { data: wData } = await supabase.from('workgroups').select('*').order('created_at', { ascending: false });
    const { data: pData } = await supabase.from('portfolios').select('*').order('created_at', { ascending: false });
    const { data: mData } = await supabase.from('workgroup_members').select('*');
    const { data: tData } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    const { data: fData } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    const { data: lData } = await supabase.from('login_logs').select('*');

    // 2. JS 레벨에서 맵핑용 딕셔너리(Lookup Map) 생성
    const workgroupMap = new Map((wData || []).map(w => [w.id, w]));
    const portfolioMap = new Map((pData || []).map(p => [p.id, p]));
    const trackMap = new Map((tData || []).map(t => [t.id, t]));

    // 3. 트랙 데이터에 포트폴리오/작업방 정보 안전 결합
    const enhancedTracks = (tData || []).map(t => {
      const ownerW = workgroupMap.get(t.workgroup_id);
      const parentP = portfolioMap.get(t.portfolio_id);
      return {
        ...t,
        track_name: t.track_name || t.title || '기본 트랙',
        view_yn: t.view_yn || 'Y',
        del_yn: t.del_yn || 'N',
        portfolio_label: ownerW?.workgroup_name || parentP?.title || '포트폴리오'
      };
    });

    // 4. 피드백 데이터에 트랙 및 작업방/포트폴리오 정보 안전 결합
    const enhancedFeedbacks = (fData || []).map(f => {
      const ownerW = workgroupMap.get(f.workgroup_id);
      const targetTrack = trackMap.get(f.track_id);
      return {
        ...f,
        portfolio_label: ownerW?.workgroup_name || '포트폴리오',
        track_name: targetTrack?.track_name || targetTrack?.title || '기본 트랙',
        author: f.author || '사용자',
        content: f.content || f.text || '',
        view_yn: f.view_yn || 'Y',
        del_yn: f.del_yn || 'N'
      };
    });

    // 5. 작업방(워크그룹) 데이터 가공
    const enhancedWorkgroups = (wData || []).map(w => {
      const wMembers = (mData || []).filter(m => m.workgroup_id === w.id);
      const wTracks = (tData || []).filter(t => t.workgroup_id === w.id);
      const wFeedbacks = (fData || []).filter(f => f.workgroup_id === w.id && f.del_yn !== 'Y');

      return {
        ...w,
        portfolio_name: w.workgroup_name,
        user_email: w.user_email || user?.email || '알 수 없음',
        member_count: 1 + wMembers.length,
        last_track_date: wTracks.length > 0 ? new Date(wTracks[0].created_at).toLocaleString() : '음원 없음',
        last_feedback_date: wFeedbacks.length > 0 ? new Date(wFeedbacks[0].created_at).toLocaleString() : '피드백 없음',
        view_yn: w.view_yn || 'Y',
        del_yn: w.del_yn || 'N'
      };
    });

    // 6. 포트폴리오 데이터 가공 (title 컬럼명 대응 포함)
    const enhancedPortfolios = (pData || []).map(p => {
      const pTracks = (tData || []).filter(t => t.portfolio_id === p.id);
      const pFeedbacks = (fData || []).filter(f => f.portfolio_id === p.id && f.del_yn !== 'Y');
      const ownerW = workgroupMap.get(p.workgroup_id);

      return {
        ...p,
        title: p.title || p.portfolio_name || '제목 없음',
        user_email: ownerW?.user_email || user?.email || '알 수 없음',
        member_count: 1,
        last_track_date: pTracks.length > 0 ? new Date(pTracks[0].created_at).toLocaleString() : '음원 없음',
        last_feedback_date: pFeedbacks.length > 0 ? new Date(pFeedbacks[0].created_at).toLocaleString() : '피드백 없음',
        view_yn: p.view_yn || 'Y',
        del_yn: p.del_yn || 'N'
      };
    });

    // 상태값 업데이트
    setAllWorkgroupsAdmin(enhancedWorkgroups);
    setAllPortfoliosAdmin(enhancedPortfolios);
    setAllTracksAdmin(enhancedTracks); 
    setAllFeedbacksAdmin(enhancedFeedbacks);

    // 로그인 로그 정렬 로직
    let sortedLogs = [];
    if (lData) {
      const activeLogs = lData.filter(l => !l.logout_time).sort((a, b) => new Date(b.login_time) - new Date(a.login_time));
      const finishedLogs = lData.filter(l => l.logout_time).sort((a, b) => new Date(b.login_time) - new Date(a.login_time));
      sortedLogs = [...activeLogs, ...finishedLogs];
    }
    setLoginLogs(sortedLogs);
  };

  const handleLoadWorkgroup = async (workgroup) => {
    setCurrentWorkgroupId(workgroup.id);
    setWorkgroupName(workgroup.workgroup_name);
    setWorkgroupOwnerEmail(workgroup.user_email || user?.email || '알 수 없음');
    setActiveTab('studio');

    const { data: feedbackData } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('workgroup_id', workgroup.id);

    if (feedbackData) {
      const activeFeedbacks = feedbackData.filter(f => f.del_yn !== 'Y');
      setComments(activeFeedbacks);
    } else {
      setComments([
        { id: 1, author: '하린', timestamp: 7, content: '여기가 맘에 들어요 짝~짝~짝~', created_at: new Date().toISOString() }
      ]);
    }

    const { data: memberData } = await supabase
      .from('workgroup_members')
      .select('*')
      .eq('workgroup_id', workgroup.id);

    setWorkgroupMembers(memberData || []);
  };

  const handleCreateWorkgroup = async () => {
    if (!user) return;
    const title = prompt('새 작업방 이름을 입력하세요:', 'viva viva viva !!');
    if (!title) return;

    const { data, error } = await supabase
      .from('workgroups')
      .insert([
        { 
          workgroup_name: title, 
          user_id: user.id, 
          user_email: user.email, 
          view_yn: 'Y',
          del_yn: 'N'
        }
      ])
      .select()
      .single();

    if (error) {
      alert('작업방 생성 실패: ' + error.message);
    } else {
      fetchMyWorkgroups(user, isAdmin);
      handleLoadWorkgroup(data);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText) return;
    const tStamp = Math.floor(currentTime);
    const newComm = {
      id: Date.now(),
      workgroup_id: currentWorkgroupId,
      author: authorName,
      timestamp: tStamp,
      content: newCommentText,
      created_at: new Date().toISOString()
    };

    setComments(prev => [newComm, ...prev]);
    setNewCommentText('');

    try {
      await supabase.from('feedbacks').insert([{
        workgroup_id: currentWorkgroupId,
        author: authorName,
        text: newCommentText,
        timestamp: tStamp,
        view_yn: 'Y',
        del_yn: 'N'
      }]);
    } catch (e) {
      console.warn('피드백 DB 저장 예외:', e);
    }
  };

  const handleAddVersion = () => {
    const nextVerNum = trackVersions.length + 1;
    const verName = `v${nextVerNum}`;
    const titleInput = prompt('새 버전 음원 타이틀을 입력하세요:', `${workgroupName} (${verName})`);
    if (!titleInput) return;

    const newVerObj = {
      id: Date.now(),
      version: verName,
      title: titleInput,
      duration: '0:48',
      date: new Date().toLocaleDateString()
    };
    setTrackVersions(prev => [...prev, newVerObj]);
    setCurrentVersion(verName);
    alert(`성공적으로 [${verName}] 버전이 업로드 및 적용되었습니다.`);
  };

  const handlePublishPortfolio = async () => {
    if (!window.confirm(`[${workgroupName}] 작업을 완료하고 포트폴리오에 등록하시겠습니까?`)) return;
    try {
      await supabase.from('portfolios').insert([{
        workgroup_id: currentWorkgroupId,
        title: workgroupName,
        view_yn: 'Y',
        del_yn: 'N'
      }]);
      alert('성공적으로 포트폴리오에 등록되었습니다!');
      setActiveTab('portfolio');
    } catch (err) {
      alert('포트폴리오 등록 완료');
      setActiveTab('portfolio');
    }
  };

  const filterByDashboardRange = (itemList, dateField) => {
    const now = new Date();
    return itemList.filter(item => {
      if (!item[dateField]) return false;
      const itemDate = new Date(item[dateField]);

      if (fromDate && toDate) {
        const fD = new Date(fromDate);
        const tD = new Date(toDate);
        tD.setHours(23, 59, 59, 999);
        return itemDate >= fD && itemDate <= tD;
      }

      if (dashboardFilterType === 'today') {
        return itemDate.toDateString() === now.toDateString();
      } else if (dashboardFilterType === 'yesterday') {
        const yest = new Date();
        yest.setDate(now.getDate() - 1);
        return itemDate.toDateString() === yest.toDateString();
      } else if (dashboardFilterType === 'week') {
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      } else if (dashboardFilterType === 'month') {
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      return true;
    });
  };

  const filteredWorkgroups = filterByDashboardRange(allWorkgroupsAdmin, 'created_at');
  const filteredPortfolios = filterByDashboardRange(allPortfoliosAdmin, 'created_at');
  const filteredFeedbacks = filterByDashboardRange(allFeedbacksAdmin.filter(f => f.del_yn !== 'Y'), 'created_at');
  const filteredLogs = filterByDashboardRange(loginLogs, 'login_time');
  const activeUsersList = loginLogs.filter(l => !l.logout_time);

  const generateTimeSeriesStats = () => {
    let slots = [];
    let daysCount = 7;
    let startDate = new Date();

    if (dashboardFilterType === 'month') {
      daysCount = 30;
    }

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      slots.push({ key: label, label, wCount: 0, pCount: 0, fCount: 0, targetDateStr: d.toDateString() });
    }

    filteredWorkgroups.forEach(w => {
      const d = new Date(w.created_at);
      const slot = slots.find(s => s.targetDateStr === d.toDateString());
      if (slot) slot.wCount += 1;
    });
    filteredPortfolios.forEach(p => {
      const d = new Date(p.created_at);
      const slot = slots.find(s => s.targetDateStr === d.toDateString());
      if (slot) slot.pCount += 1;
    });
    filteredFeedbacks.forEach(f => {
      const d = new Date(f.created_at);
      const slot = slots.find(s => s.targetDateStr === d.toDateString());
      if (slot) slot.fCount += 1;
    });

    return slots;
  };

  const timeSeriesData = generateTimeSeriesStats();
  const maxTimeSeriesVal = Math.max(...timeSeriesData.map(s => Math.max(s.wCount, s.pCount, s.fCount)), 1);

  // 로그인 이력 필터 및 [10/50/100건] 제한
  const searchedLoginLogs = loginLogs.filter(log => {
    const matchKeyword = !loginSearchKeyword || 
      (log.user_email && log.user_email.toLowerCase().includes(loginSearchKeyword.toLowerCase())) || 
      (log.device && log.device.toLowerCase().includes(loginSearchKeyword.toLowerCase()));
    
    const matchLocation = !loginLocationKeyword || 
      (log.location && log.location.toLowerCase().includes(loginLocationKeyword.toLowerCase()));

    let matchDate = true;
    if (loginFromDate && loginToDate && log.login_time) {
      const itemD = new Date(log.login_time);
      const fD = new Date(loginFromDate);
      const tD = new Date(loginToDate);
      tD.setHours(23, 59, 59, 999);
      matchDate = itemD >= fD && itemD <= tD;
    }

    return matchKeyword && matchLocation && matchDate;
  }).slice(0, loginLimitCount);

  // 관리 페이지 필터 및 제한
  const searchedWorkgroups = allWorkgroupsAdmin.filter(w => {
    const matchName = !workgroupSearchKeyword || (w.workgroup_name && w.workgroup_name.toLowerCase().includes(workgroupSearchKeyword.toLowerCase()));
    let matchDate = true;
    if (workgroupFromDate && workgroupToDate && w.created_at) {
      const itemD = new Date(w.created_at);
      const fD = new Date(workgroupFromDate);
      const tD = new Date(workgroupToDate);
      tD.setHours(23, 59, 59, 999);
      matchDate = itemD >= fD && itemD <= tD;
    }
    return matchName && matchDate;
  }).slice(0, workgroupLimitCount);

  const searchedPortfolios = allPortfoliosAdmin.filter(p => {
    const matchName = !portfolioSearchKeyword || (p.title && p.title.toLowerCase().includes(portfolioSearchKeyword.toLowerCase()));
    let matchDate = true;
    if (portfolioFromDate && portfolioToDate && p.created_at) {
      const itemD = new Date(p.created_at);
      const fD = new Date(portfolioFromDate);
      const tD = new Date(portfolioToDate);
      tD.setHours(23, 59, 59, 999);
      matchDate = itemD >= fD && itemD <= tD;
    }
    return matchName && matchDate;
  }).slice(0, portfolioLimitCount);

  const searchedTracks = allTracksAdmin.filter(t => {
    const matchName = !trackSearchKeyword || (t.track_name && t.track_name.toLowerCase().includes(trackSearchKeyword.toLowerCase()));
    let matchDate = true;
    if (trackFromDate && trackToDate && t.created_at) {
      const itemD = new Date(t.created_at);
      const fD = new Date(trackFromDate);
      const tD = new Date(trackToDate);
      tD.setHours(23, 59, 59, 999);
      matchDate = itemD >= fD && itemD <= tD;
    }
    return matchName && matchDate;
  }).slice(0, trackLimitCount);

  const searchedFeedbacks = allFeedbacksAdmin.filter(f => {
    const matchContent = !feedbackSearchKeyword || (f.content && f.content.toLowerCase().includes(feedbackSearchKeyword.toLowerCase()));
    let matchDate = true;
    if (feedbackFromDate && feedbackToDate && f.created_at) {
      const itemD = new Date(f.created_at);
      const fD = new Date(feedbackFromDate);
      const tD = new Date(feedbackToDate);
      tD.setHours(23, 59, 59, 999);
      matchDate = itemD >= fD && itemD <= tD;
    }
    return matchContent && matchDate;
  }).slice(0, feedbackLimitCount);

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'sans-serif' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1e293b' }}>🎵 TAMIS 작업방 로그인</h2>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="이메일 입력" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
          <input type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
          <button type="submit" style={{ padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isSignUp ? '회원가입 하기' : '로그인 하기'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '30px auto', padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#4f46e5' }}>👤 {user.email}</span> 
          {isSystemAdmin && (
            <span style={{ marginLeft: '6px', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              👑 시스템 관리자
            </span>
          )}
          {isPortfolioAdmin && (
            <span style={{ marginLeft: '6px', background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              💼 포트폴리오 관리자
            </span>
          )}
          {!isSystemAdmin && !isPortfolioAdmin && (
            <span style={{ marginLeft: '6px', background: '#64748b', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              👤 일반 사용자
            </span>
          )}
          님 접속중
        </div>

        {/* 상단 네비게이션바 */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('portfolio'); fetchMyWorkgroups(user, isAdmin); }} style={{ padding: '6px 10px', background: activeTab === 'portfolio' ? '#4f46e5' : '#e2e8f0', color: activeTab === 'portfolio' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            📁 작업방 목록
          </button>
          
          {(isSystemAdmin || isPortfolioAdmin) && (
            <>
              <button onClick={() => { setActiveTab('admin_dashboard'); fetchAdminData(); }} style={{ padding: '6px 10px', background: activeTab === 'admin_dashboard' ? '#0f172a' : '#e2e8f0', color: activeTab === 'admin_dashboard' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                📊 대시보드
              </button>
              <button onClick={() => { setActiveTab('admin_management'); fetchAdminData(); }} style={{ padding: '6px 10px', background: activeTab === 'admin_management' ? '#0f172a' : '#e2e8f0', color: activeTab === 'admin_management' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                ⚙️ 관리 페이지
              </button>
            </>
          )}

          {isSystemAdmin && (
            <button onClick={() => { setActiveTab('admin_status'); fetchAdminData(); }} style={{ padding: '6px 10px', background: activeTab === 'admin_status' ? '#0f172a' : '#e2e8f0', color: activeTab === 'admin_status' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              📋 관리자 현황 관리
            </button>
          )}

          <button onClick={handleLogout} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 라우팅 및 탭 분기 */}
      {activeTab === 'admin_dashboard' && (isSystemAdmin || isPortfolioAdmin) ? (
        <AdminDashboard
          dashboardFilterType={dashboardFilterType}
          setDashboardFilterType={setDashboardFilterType}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          activeUsersList={activeUsersList}
          selectedActiveUser={selectedActiveUser}
          setSelectedActiveUser={setSelectedActiveUser}
          handleForceLogoutUser={handleForceLogoutUser}
          allWorkgroupsAdmin={allWorkgroupsAdmin}
          allPortfoliosAdmin={allPortfoliosAdmin}
          allFeedbacksAdmin={allFeedbacksAdmin}
          loginLogs={loginLogs}
          filteredWorkgroups={filteredWorkgroups}
          filteredPortfolios={filteredPortfolios}
          filteredFeedbacks={filteredFeedbacks}
          filteredLogs={filteredLogs}
          timeSeriesData={timeSeriesData}
          maxTimeSeriesVal={maxTimeSeriesVal}
        />
      ) : activeTab === 'admin_management' && (isSystemAdmin || isPortfolioAdmin) ? (
        <AdminManagement
          workgroupSearchKeyword={workgroupSearchKeyword} setWorkgroupSearchKeyword={setWorkgroupSearchKeyword}
          workgroupFromDate={workgroupFromDate} setWorkgroupFromDate={setWorkgroupFromDate}
          workgroupToDate={workgroupToDate} setWorkgroupToDate={setWorkgroupToDate}
          workgroupLimitCount={workgroupLimitCount} setWorkgroupLimitCount={setWorkgroupLimitCount}
          searchedWorkgroups={searchedWorkgroups}
          
          portfolioSearchKeyword={portfolioSearchKeyword} setPortfolioSearchKeyword={setPortfolioSearchKeyword}
          portfolioFromDate={portfolioFromDate} setPortfolioFromDate={setPortfolioFromDate}
          portfolioToDate={portfolioToDate} setPortfolioToDate={setPortfolioToDate}
          portfolioLimitCount={portfolioLimitCount} setPortfolioLimitCount={setPortfolioLimitCount}
          searchedPortfolios={searchedPortfolios}
          
          trackSearchKeyword={trackSearchKeyword} setTrackSearchKeyword={setTrackSearchKeyword}
          trackFromDate={trackFromDate} setTrackFromDate={setTrackFromDate}
          trackToDate={trackToDate} setTrackToDate={setTrackToDate}
          trackLimitCount={trackLimitCount} setTrackLimitCount={setTrackLimitCount}
          searchedTracks={searchedTracks}

          feedbackSearchKeyword={feedbackSearchKeyword} setFeedbackSearchKeyword={setFeedbackSearchKeyword}
          feedbackFromDate={feedbackFromDate} setFeedbackFromDate={setFeedbackFromDate}
          feedbackToDate={feedbackToDate} setFeedbackToDate={setFeedbackToDate}
          feedbackLimitCount={feedbackLimitCount} setFeedbackLimitCount={setFeedbackLimitCount}
          searchedFeedbacks={searchedFeedbacks}

          fetchAdminData={fetchAdminData}
        />
      ) : activeTab === 'admin_status' && isSystemAdmin ? (
        <AdminStatus
          adminList={adminList}
          newAdminEmail={newAdminEmail} setNewAdminEmail={setNewAdminEmail}
          newAdminName={newAdminName} setNewAdminName={setNewAdminName}
          newAdminRole={newAdminRole} setNewAdminRole={setNewAdminRole}
          handleAddAdminDB={handleAddAdminDB}
          handleDeleteAdminDB={handleDeleteAdminDB}
          loginLogs={loginLogs}
          searchedLoginLogs={searchedLoginLogs}
          activeUsersList={activeUsersList}
          selectedActiveUser={selectedActiveUser}
          setSelectedActiveUser={setSelectedActiveUser}
          loginSearchKeyword={loginSearchKeyword} setLoginSearchKeyword={setLoginSearchKeyword}
          loginLocationKeyword={loginLocationKeyword} setLoginLocationKeyword={setLoginLocationKeyword}
          loginFromDate={loginFromDate} setLoginFromDate={setLoginFromDate}
          loginToDate={loginToDate} setLoginToDate={setLoginToDate}
          loginLimitCount={loginLimitCount} setLoginLimitCount={setLoginLimitCount}
          fetchAdminData={fetchAdminData}
          handleForceLogoutUser={handleForceLogoutUser}
          allWorkgroupsAdmin={allWorkgroupsAdmin}
          allPortfoliosAdmin={allPortfoliosAdmin}
          allFeedbacksAdmin={allFeedbacksAdmin}
        />
      ) : activeTab === 'portfolio' ? (
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>📁 나의 작업방 목록</h2>
            <button onClick={handleCreateWorkgroup} style={{ padding: '8px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              ➕ 새 작업방 만들기
            </button>
          </div>

          {myWorkgroups.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', background: '#f8fafc', borderRadius: '10px' }}>
              생성된 작업방이 없습니다. 새 작업방을 만들어보세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myWorkgroups.map((w) => (
                <div key={w.id} style={{ padding: '18px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '17px' }}>{w.workgroup_name}</span>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>생성일: {new Date(w.created_at).toLocaleDateString()} | 피드백 {w.feedback_count || 0}개</div>
                  </div>
                  <button onClick={() => handleLoadWorkgroup(w)} style={{ padding: '10px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    📂 작업방 열기 (스튜디오)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <StudioPage
          setActiveTab={setActiveTab}
          workgroupName={workgroupName}
          currentVersion={currentVersion}
          handleAddVersion={handleAddVersion}
          waveformContainerRef={waveformContainerRef}
          currentTime={currentTime}
          duration={duration}
          togglePlay={togglePlay}
          isPlaying={isPlaying}
          newCommentText={newCommentText}
          setNewCommentText={setNewCommentText}
          handleAddComment={handleAddComment}
          studioSubTab={studioSubTab}
          setStudioSubTab={setStudioSubTab}
          comments={comments}
          trackVersions={trackVersions}
          workgroupMembers={workgroupMembers}
          handlePublishPortfolio={handlePublishPortfolio}
        />
      )}
    </div>
  );
}