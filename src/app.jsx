import React, { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { supabase } from './supabaseClient'; 

export default function App() {
  // 1. 인증(Login) 상태 
  const [user, setUser] = useState(null);   
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const currentLogIdRef = useRef(null);

  // 2. 탭 관리 상태
  const [activeTab, setActiveTab] = useState('portfolio');
  const [myWorkgroups, setMyWorkgroups] = useState([]);
  const [currentWorkgroupId, setCurrentWorkgroupId] = useState(null);
  const [workgroupName, setWorkgroupName] = useState('새 작업방');
  const [workgroupOwnerEmail, setWorkgroupOwnerEmail] = useState(''); 
  const [workgroupMembers, setWorkgroupMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');

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

  // 5. 관리자 현황 관리 전용 검색 및 필터 상태
  const [loginSearchKeyword, setLoginSearchKeyword] = useState('');
  const [loginLocationKeyword, setLoginLocationKeyword] = useState('');
  const [loginFromDate, setLoginFromDate] = useState('');
  const [loginToDate, setLoginToDate] = useState('');
  const [loginLimitCount, setLoginLimitCount] = useState(10);

  // 관리 페이지(작업방, 포트폴리오, 음원, 피드백) 전용 검색 및 필터 상태
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
  const [playMode, setPlayMode] = useState('none'); 
  const [isMainPlaying, setIsMainPlaying] = useState(false);
  const [activeSequentialTrackId, setActiveSequentialTrackId] = useState(null);
  const [trackPlayingStates, setTrackPlayingStates] = useState({});
  const [tracks, setTracks] = useState([]);

  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('사용자');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  const wavesurferRefs = useRef({});
  const containerRefs = useRef({});
  const trackListRef = useRef(tracks);
  trackListRef.current = tracks;

  // 관리자 판별 및 역할 분기
  const checkIsAdmin = (userEmail) => {
    if (!userEmail) return false;
    const found = adminList.find(a => a.email.toLowerCase() === userEmail.toLowerCase());
    if (found) return true;
    return userEmail === 'admin@admin.com' || userEmail.startsWith('admin') || userEmail === 'krsungjun@gmail.com' || userEmail === 'babadol@naver.com';
  };

  const currentAdminInfo = user ? adminList.find(a => a.email.toLowerCase() === user.email.toLowerCase()) : null;
  
  // 시스템 관리자 vs 포트폴리오 관리자 정밀 판별
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
      let ip = 'Unknown IP';
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
    const { data: wData } = await supabase.from('workgroups').select('*').order('created_at', { ascending: false });
    const { data: pData } = await supabase.from('portfolios').select('*').order('created_at', { ascending: false });
    const { data: mData } = await supabase.from('workgroup_members').select('*');
    const { data: tData } = await supabase.from('tracks').select('*').order('created_at', { ascending: false });
    const { data: fData } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false });
    const { data: lData } = await supabase.from('login_logs').select('*');

    const workgroupMap = new Map((wData || []).map(w => [w.id, w]));
    const trackMap = new Map((tData || []).map(t => [t.id, t]));

    const enhancedTracks = (tData || []).map(t => {
      const ownerW = workgroupMap.get(t.workgroup_id);
      return {
        ...t,
        track_name: t.track_name || t.title || '기본 트랙',
        view_yn: t.view_yn || 'Y',
        del_yn: t.del_yn || 'N',
        portfolio_label: ownerW?.workgroup_name || '포트폴리오'
      };
    });

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

    const enhancedPortfolios = (pData || []).map(p => {
      const pTracks = (tData || []).filter(t => t.portfolio_id === p.id);
      const pFeedbacks = (fData || []).filter(f => f.portfolio_id === p.id && f.del_yn !== 'Y');
      const ownerW = workgroupMap.get(p.workgroup_id);

      return {
        ...p,
        user_email: ownerW?.user_email || user?.email || '알 수 없음',
        member_count: 1,
        last_track_date: pTracks.length > 0 ? new Date(pTracks[0].created_at).toLocaleString() : '음원 없음',
        last_feedback_date: pFeedbacks.length > 0 ? new Date(pFeedbacks[0].created_at).toLocaleString() : '피드백 없음',
        view_yn: p.view_yn || 'Y',
        del_yn: p.del_yn || 'N'
      };
    });

    setAllWorkgroupsAdmin(enhancedWorkgroups);
    setAllPortfoliosAdmin(enhancedPortfolios);
    setAllTracksAdmin(enhancedTracks); 
    setAllFeedbacksAdmin(enhancedFeedbacks);

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

    const { data: trackData } = await supabase
      .from('tracks')
      .select('*')
      .eq('workgroup_id', workgroup.id)
      .order('order', { ascending: true });

    if (trackData && trackData.length > 0) {
      const activeTracks = trackData.filter(t => t.del_yn !== 'Y');
      setTracks(activeTracks);
      setSelectedTrack(activeTracks.length > 0 ? activeTracks[0].id : '');
    } else {
      setTracks([]);
      setSelectedTrack('');
    }

    const { data: feedbackData } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('workgroup_id', workgroup.id);

    if (feedbackData) {
      const activeFeedbacks = feedbackData.filter(f => f.del_yn !== 'Y');
      setComments(activeFeedbacks);
    } else {
      setComments([]);
    }

    const { data: memberData } = await supabase
      .from('workgroup_members')
      .select('*')
      .eq('workgroup_id', workgroup.id);

    setWorkgroupMembers(memberData || []);
  };

  const handleCreateWorkgroup = async () => {
    if (!user) return;
    const title = prompt('새 작업방 이름을 입력하세요:', '나의 새 작업방');
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

        {/* 상단 네비게이션바 (권한 등급별 메뉴 분기 적용) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveTab('portfolio'); fetchMyWorkgroups(user, isAdmin); }} style={{ padding: '6px 10px', background: activeTab === 'portfolio' ? '#4f46e5' : '#e2e8f0', color: activeTab === 'portfolio' ? '#fff' : '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
            📁 작업방 목록
          </button>
          
          {/* 시스템 관리자 또는 포트폴리오 관리자 모두 대시보드 & 관리 페이지 접근 가능 */}
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

          {/* 시스템 관리자만 접근 가능한 '관리자 현황 관리' 메뉴 (포트폴리오 관리자 및 일반 사용자 제외) */}
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

      {activeTab === 'admin_dashboard' && (isSystemAdmin || isPortfolioAdmin) ? (
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
                                ({diffMins}분)
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
                    <div><strong>최근 접속 IP / 위치:</strong> {selectedActiveUser.ip_address || '211.235.88.212'} / {selectedActiveUser.location || 'South Korea (Ulsan)'}</div>
                    <div style={{ wordBreak: 'break-all' }}><strong>접속 기기(Device):</strong> <span style={{ fontSize: '11px', color: '#64748b' }}>{selectedActiveUser.device || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}</span></div>
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

          {/* 주요 상단 카운트 카드 */}
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

          {/* 시계열 현황 그래프 */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: 0 }}>📈 1. 시계열 현황 (작업방 / 포트폴리오 / 피드백수)</h3>
              <div style={{ fontSize: '11px', color: '#475569', background: '#fff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                🔵 작업방 | 🟦 포트폴리오 | 🟠 피드백
              </div>
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
                      <div style={{ width: '28%', background: '#4f46e5', height: `${Math.max(wHeight, 4)}px`, borderRadius: '2px 2px 0 0' }} title={`작업방: ${stat.wCount}`} />
                      <div style={{ width: '28%', background: '#3b82f6', height: `${Math.max(pHeight, 4)}px`, borderRadius: '2px 2px 0 0' }} title={`포트폴리오: ${stat.pCount}`} />
                      <div style={{ width: '28%', background: '#f59e0b', height: `${Math.max(fHeight, 4)}px`, borderRadius: '2px 2px 0 0' }} title={`피드백: ${stat.fCount}`} />
                    </div>
                    <span style={{ fontSize: '9px', color: '#475569', marginTop: '6px', whiteSpace: 'nowrap' }}>{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 콘텐츠 및 피드백 지표 & 로그인 지역 및 접속 분포 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>🎵 2. 콘텐츠 및 피드백 지표</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span>기간 내 작업방 수</span>
                  <strong style={{ color: '#4f46e5' }}>{filteredWorkgroups.length} 개</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span>기간 내 포트폴리오 수</span>
                  <strong style={{ color: '#3b82f6' }}>{filteredPortfolios.length} 개</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span>기간 내 피드백 수</span>
                  <strong style={{ color: '#10b981' }}>{filteredFeedbacks.length} 건</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span>기간 내 피드백 회원수</span>
                  <strong style={{ color: '#f59e0b' }}>{new Set(filteredFeedbacks.map(f => f.author)).size} 명</strong>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>🌍 3. 로그인 지역 및 접속 분포</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', maxHeight: '210px', overflowY: 'auto' }}>
                {Object.entries(
                  loginLogs.reduce((acc, log) => {
                    const loc = log.location || '대한민국 (Seoul)';
                    acc[loc] = (acc[loc] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([loc, count], idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <span>📍 {loc}</span>
                    <strong style={{ color: '#4f46e5' }}>{count} 명</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'admin_management' && (isSystemAdmin || isPortfolioAdmin) ? (
        // 관리 페이지 (작업방, 포트폴리오, 음원, 피드백 관리 포틀릿 통합)
        <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>⚙️ 관리 페이지 (조회/사용 여부 및 상세 정보 관리)</h2>

          {/* 1. 작업방 사용(조회) 여부 및 상세 관리 */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📁 작업방 사용(조회) 여부 및 상세 관리
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="작업방 명 검색..." 
                value={workgroupSearchKeyword} 
                onChange={(e) => setWorkgroupSearchKeyword(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '160px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="date" value={workgroupFromDate} onChange={(e) => setWorkgroupFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                <span>~</span>
                <input type="date" value={workgroupToDate} onChange={(e) => setWorkgroupToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span>조회:</span>
                <label><input type="radio" name="wLimit" checked={workgroupLimitCount === 10} onChange={() => setWorkgroupLimitCount(10)} /> 10건</label>
                <label><input type="radio" name="wLimit" checked={workgroupLimitCount === 50} onChange={() => setWorkgroupLimitCount(50)} /> 50건</label>
                <label><input type="radio" name="wLimit" checked={workgroupLimitCount === 100} onChange={() => setWorkgroupLimitCount(100)} /> 100건</label>
              </div>
              <button onClick={fetchAdminData} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>작업방 명</th>
                    <th style={{ padding: '8px' }}>이메일 (소유자)</th>
                    <th style={{ padding: '8px' }}>회원수</th>
                    <th style={{ padding: '8px' }}>최종 음원 조회일자</th>
                    <th style={{ padding: '8px' }}>최종 피드백 수정일자</th>
                    <th style={{ padding: '8px' }}>사용 여부</th>
                    <th style={{ padding: '8px' }}>삭제 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedWorkgroups.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 작업방이 없습니다.</td></tr>
                  ) : (
                    searchedWorkgroups.map((w) => (
                      <tr key={w.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#1e293b' }}>{w.workgroup_name}</td>
                        <td style={{ padding: '8px', color: '#4f46e5' }}>{w.user_email}</td>
                        <td style={{ padding: '8px' }}>{w.member_count} 명</td>
                        <td style={{ padding: '8px' }}>{w.last_track_date}</td>
                        <td style={{ padding: '8px' }}>{w.last_feedback_date}</td>
                        <td style={{ padding: '8px' }}><span style={{ color: w.view_yn !== 'N' ? '#15803d' : '#ef4444', fontWeight: 'bold' }}>{w.view_yn !== 'N' ? '사용중' : '중지'}</span></td>
                        <td style={{ padding: '8px' }}><span style={{ color: w.del_yn === 'Y' ? '#ef4444' : '#64748b' }}>{w.del_yn === 'Y' ? '삭제됨' : '정상'}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. 포트폴리오 사용(조회) 여부 및 상세 관리 */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📁 포트폴리오 사용(조회) 여부 및 상세 관리
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="명칭 검색..." 
                value={portfolioSearchKeyword} 
                onChange={(e) => setPortfolioSearchKeyword(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '160px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="date" value={portfolioFromDate} onChange={(e) => setPortfolioFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                <span>~</span>
                <input type="date" value={portfolioToDate} onChange={(e) => setPortfolioToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span>조회:</span>
                <label><input type="radio" name="pLimit" checked={portfolioLimitCount === 10} onChange={() => setPortfolioLimitCount(10)} /> 10건</label>
                <label><input type="radio" name="pLimit" checked={portfolioLimitCount === 50} onChange={() => setPortfolioLimitCount(50)} /> 50건</label>
                <label><input type="radio" name="pLimit" checked={portfolioLimitCount === 100} onChange={() => setPortfolioLimitCount(100)} /> 100건</label>
              </div>
              <button onClick={fetchAdminData} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>포트폴리오 명</th>
                    <th style={{ padding: '8px' }}>이메일 (소유자)</th>
                    <th style={{ padding: '8px' }}>회원수</th>
                    <th style={{ padding: '8px' }}>최종 음원 조회일자</th>
                    <th style={{ padding: '8px' }}>최종 피드백 수정일자</th>
                    <th style={{ padding: '8px' }}>사용 여부</th>
                    <th style={{ padding: '8px' }}>삭제 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedPortfolios.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 포트폴리오가 없습니다.</td></tr>
                  ) : (
                    searchedPortfolios.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold', color: '#1e293b' }}>{p.title}</td>
                        <td style={{ padding: '8px', color: '#4f46e5' }}>{p.user_email}</td>
                        <td style={{ padding: '8px' }}>{p.member_count} 명</td>
                        <td style={{ padding: '8px' }}>{p.last_track_date}</td>
                        <td style={{ padding: '8px' }}>{p.last_feedback_date}</td>
                        <td style={{ padding: '8px' }}><span style={{ color: p.view_yn !== 'N' ? '#15803d' : '#ef4444', fontWeight: 'bold' }}>{p.view_yn !== 'N' ? '사용중' : '중지'}</span></td>
                        <td style={{ padding: '8px' }}><span style={{ color: p.del_yn === 'Y' ? '#ef4444' : '#64748b' }}>{p.del_yn === 'Y' ? '삭제됨' : '정상'}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. 음원 사용(조회) 여부 및 상세 관리 */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎵 음원 사용(조회) 여부 및 상세 관리
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="음원명 검색..." 
                value={trackSearchKeyword} 
                onChange={(e) => setTrackSearchKeyword(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '160px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="date" value={trackFromDate} onChange={(e) => setTrackFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                <span>~</span>
                <input type="date" value={trackToDate} onChange={(e) => setTrackToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span>조회:</span>
                <label><input type="radio" name="tLimit" checked={trackLimitCount === 10} onChange={() => setTrackLimitCount(10)} /> 10건</label>
                <label><input type="radio" name="tLimit" checked={trackLimitCount === 50} onChange={() => setTrackLimitCount(50)} /> 50건</label>
                <label><input type="radio" name="tLimit" checked={trackLimitCount === 100} onChange={() => setTrackLimitCount(100)} /> 100건</label>
              </div>
              <button onClick={fetchAdminData} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>포트폴리오 명</th>
                    <th style={{ padding: '8px' }}>음원명</th>
                    <th style={{ padding: '8px' }}>등록일자</th>
                    <th style={{ padding: '8px' }}>사용 여부</th>
                    <th style={{ padding: '8px' }}>삭제 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedTracks.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 음원이 없습니다.</td></tr>
                  ) : (
                    searchedTracks.map((t) => {
                      const isDeleted = t.del_yn === 'Y';
                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1', background: isDeleted ? '#fee2e2' : 'transparent' }}>
                          <td style={{ padding: '8px', color: '#334155' }}>{t.portfolio_label}</td>
                          <td style={{ padding: '8px', fontWeight: 'bold' }}>
                            <span style={{ color: '#4f46e5' }}>{t.track_name}</span>
                            {isDeleted && <span style={{ color: '#ef4444', marginLeft: '6px' }}>(삭제됨)</span>}
                          </td>
                          <td style={{ padding: '8px' }}>{new Date(t.created_at).toLocaleString()}</td>
                          <td style={{ padding: '8px' }}><span style={{ background: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}>Y (사용 중)</span></td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ background: isDeleted ? '#ef4444' : '#e2e8f0', color: isDeleted ? '#fff' : '#475569', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}>
                              {isDeleted ? 'Y (삭제됨)' : 'N (정상)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. 피드백 사용(조회) 여부 및 상세 관리 */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💬 피드백 사용(조회) 여부 및 상세 관리
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <input 
                type="text" 
                placeholder="내용 검색..." 
                value={feedbackSearchKeyword} 
                onChange={(e) => setFeedbackSearchKeyword(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', flex: '1', minWidth: '160px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="date" value={feedbackFromDate} onChange={(e) => setFeedbackFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                <span>~</span>
                <input type="date" value={feedbackToDate} onChange={(e) => setFeedbackToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span>조회:</span>
                <label><input type="radio" name="fLimit" checked={feedbackLimitCount === 10} onChange={() => setFeedbackLimitCount(10)} /> 10건</label>
                <label><input type="radio" name="fLimit" checked={feedbackLimitCount === 50} onChange={() => setFeedbackLimitCount(50)} /> 50건</label>
                <label><input type="radio" name="fLimit" checked={feedbackLimitCount === 100} onChange={() => setFeedbackLimitCount(100)} /> 100건</label>
              </div>
              <button onClick={fetchAdminData} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>포트폴리오 명</th>
                    <th style={{ padding: '8px' }}>음원명</th>
                    <th style={{ padding: '8px' }}>작성자</th>
                    <th style={{ padding: '8px' }}>내용</th>
                    <th style={{ padding: '8px' }}>등록일자</th>
                    <th style={{ padding: '8px' }}>사용 여부</th>
                    <th style={{ padding: '8px' }}>삭제 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedFeedbacks.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 피드백이 없습니다.</td></tr>
                  ) : (
                    searchedFeedbacks.map((f) => {
                      const isDeleted = f.del_yn === 'Y';
                      return (
                        <tr key={f.id} style={{ borderBottom: '1px solid #cbd5e1', background: isDeleted ? '#fee2e2' : 'transparent' }}>
                          <td style={{ padding: '8px', color: '#334155' }}>{f.portfolio_label}</td>
                          <td style={{ padding: '8px', color: '#4f46e5', fontWeight: 'bold' }}>{f.track_name}</td>
                          <td style={{ padding: '8px' }}>{f.author}</td>
                          <td style={{ padding: '8px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.content}</td>
                          <td style={{ padding: '8px' }}>{new Date(f.created_at).toLocaleString()}</td>
                          <td style={{ padding: '8px' }}><span style={{ background: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}>Y (사용 중)</span></td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ background: isDeleted ? '#ef4444' : '#15803d', color: '#fff', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '10px' }}>
                              {isDeleted ? 'Y (삭제됨)' : 'N (정상)'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'admin_status' && isSystemAdmin ? (
        // 관리자 현황 관리 메뉴 탭 (시스템 관리자 전용)
        <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>📋 관리자 현황 관리 (시스템 접속 및 권한 제어)</h2>

          {/* 1. 관리자 현황 및 권한 등급 관리 */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                👑 관리자 현황 및 권한 등급 관리 (DB 연동 & 기능별 세부 권한 확장)
              </h3>
              <div style={{ background: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                시스템 관리자: <span style={{ color: '#4f46e5' }}>{adminList.filter(a => a.role === '시스템 관리자').length} / 3명</span> | 포트폴리오 관리자: <span style={{ color: '#3b82f6' }}>{adminList.filter(a => a.role === '포트폴리오 관리자').length} / 10명</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>신규 관리자 DB 등록</h4>
                <form onSubmit={handleAddAdminDB} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="email" 
                    placeholder="관리자 이메일 입력" 
                    value={newAdminEmail} 
                    onChange={(e) => setNewAdminEmail(e.target.value)} 
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="관리자 성명/직책" 
                    value={newAdminName} 
                    onChange={(e) => setNewAdminName(e.target.value)} 
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
                    required 
                  />
                  <select 
                    value={newAdminRole} 
                    onChange={(e) => setNewAdminRole(e.target.value)} 
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                  >
                    <option value="포트폴리오 관리자 (최대 10명)">포트폴리오 관리자 (최대 10명)</option>
                    <option value="시스템 관리자 (최대 3명)">시스템 관리자 (최대 3명)</option>
                  </select>
                  <button type="submit" style={{ padding: '10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>
                    관리자 DB 추가 ➕
                  </button>
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
                    {adminList.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>등록된 관리자가 없습니다.</td></tr>
                    ) : (
                      adminList.map((adm) => {
                        const isSysAdmin = adm.role === '시스템 관리자';
                        return (
                          <tr key={adm.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '8px', fontWeight: 'bold', color: '#1e293b' }}>{adm.name}</td>
                            <td style={{ padding: '8px', color: '#4f46e5' }}>{adm.email}</td>
                            <td style={{ padding: '8px' }}>
                              <span style={{ background: isSysAdmin ? '#fee2e2' : '#dbeafe', color: isSysAdmin ? '#991b1b' : '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', display: 'inline-block', marginBottom: '3px' }}>
                                {adm.role}
                              </span>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>
                                📁 포트폴리오:all | 🎵 음원:all | 💬 피드백:all
                              </div>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                <button onClick={() => alert(`${adm.name} 관리자의 권한 수정 모달을 엽니다.`)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>수정</button>
                                <button onClick={() => handleDeleteAdminDB(adm.id, adm.email)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>해제</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. 전체 로그인 이력 및 현재 접속자 현황 */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', border: '1px solid #15803d' }}></span>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
                  전체 로그인 이력 및 현재 접속자 현황 ({activeUsersList.length}명 접속 중)
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>유저를 클릭하면 상세 정보를 조회합니다</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
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
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: '160px' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input type="date" value={loginFromDate} onChange={(e) => setLoginFromDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
                <span>~</span>
                <input type="date" value={loginToDate} onChange={(e) => setLoginToDate(e.target.value)} style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span>조회:</span>
                <label><input type="radio" name="lLimit" checked={loginLimitCount === 10} onChange={() => setLoginLimitCount(10)} /> 10건</label>
                <label><input type="radio" name="lLimit" checked={loginLimitCount === 50} onChange={() => setLoginLimitCount(50)} /> 50건</label>
                <label><input type="radio" name="lLimit" checked={loginLimitCount === 100} onChange={() => setLoginLimitCount(100)} /> 100건</label>
              </div>
              <button onClick={fetchAdminData} style={{ padding: '6px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>조회</button>
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
                    {searchedLoginLogs.length === 0 ? (
                      <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>조건에 맞는 로그인 이력이 없습니다.</td></tr>
                    ) : (
                      searchedLoginLogs.map((log) => {
                        const isActive = !log.logout_time;
                        const loginDate = new Date(log.login_time);
                        const diffMins = Math.floor((new Date() - loginDate) / (1000 * 60));
                        const isSelected = selectedActiveUser?.id === log.id;

                        return (
                          <tr 
                            key={log.id} 
                            onClick={() => setSelectedActiveUser(log)}
                            style={{ borderBottom: '1px solid #cbd5e1', cursor: 'pointer', background: isSelected ? '#e0e7ff' : (isActive ? '#f0fdf4' : 'transparent') }}
                          >
                            <td style={{ padding: '8px', fontWeight: 'bold', color: '#4f46e5' }}>{log.user_email}</td>
                            <td style={{ padding: '8px' }}>{loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                            <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isActive ? (
                                <>
                                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    ({diffMins}분) 접속 중
                                  </span>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleForceLogoutUser(log.id, log.user_email); }} 
                                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                  >
                                    강제종료
                                  </button>
                                </>
                              ) : (
                                <span style={{ color: '#64748b' }}>종료됨</span>
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
                    <div><strong>최근 접속 IP / 위치:</strong> {selectedActiveUser.ip_address || '211.235.88.212'} / {selectedActiveUser.location || 'South Korea (Ulsan)'}</div>
                    <div style={{ wordBreak: 'break-all' }}><strong>접속 기기(Device):</strong> <span style={{ fontSize: '11px', color: '#64748b' }}>{selectedActiveUser.device || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}</span></div>
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
              생성된 작업방이 없습니다.
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
                    📂 작업방 열기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '10px 0' }}>
          <h2>🎛️ 스튜디오 작업방: {workgroupName}</h2>
          <button onClick={() => setActiveTab('portfolio')} style={{ padding: '6px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            ← 작업방 목록으로 돌아가기 
          </button>
        </div>
      )}
    </div>
  );
}