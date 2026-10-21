import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, ArrowRight, Bell, CalendarDays, CheckCircle2, Clock3, Download,
  FileClock, LogOut, Menu, Plus, Search, ShieldCheck, Users, Wallet, X,
  CalendarCheck, ClipboardList, AlertCircle
} from 'lucide-react';
import './style.css';

const API = import.meta.env.VITE_API_BASE || '/api';
const DEMO_KEY = 'pm-core-demo-session';

const demoUser = {
  id: 'demo-user',
  name: 'Damnsunny Demo',
  email: 'admin@pmcore.local',
  role: 'SUPER_ADMIN',
  department: 'PM Core',
  must_change_password: false,
};

const demoData = {
  user: demoUser,
  dashboard: {
    counts: [
      { status: 'PENDING', count: 2 },
      { status: 'L1_REVIEW', count: 1 },
      { status: 'L2_REVIEW', count: 1 },
      { status: 'APPROVED', count: 8 },
      { status: 'REJECTED', count: 1 },
    ],
    people: { active: 14 },
    balances: [
      { code: 'CL', name: 'Casual Leave', balance: 8, allocated: 12 },
      { code: 'SL', name: 'Sick Leave', balance: 6, allocated: 8 },
      { code: 'CO', name: 'Comp Off', balance: 3, allocated: 12 },
    ],
  },
  apps: [
    { id: 'app-1', employee_name: 'Aditi Sharma', emp_code: 'PM002', from_date: '2026-10-20', to_date: '2026-10-22', working_days: 3, status: 'PENDING', reason: 'Family vacation', is_lwp: false, allocations: [{ code: 'CL', name: 'Casual Leave', days: 3 }] },
    { id: 'app-2', employee_name: 'Nikhil Verma', emp_code: 'PM003', from_date: '2026-10-11', to_date: '2026-10-12', working_days: 2, status: 'APPROVED', reason: 'Personal travel', is_lwp: false, allocations: [{ code: 'CL', name: 'Casual Leave', days: 2 }] },
    { id: 'app-3', employee_name: 'Damnsunny Demo', emp_code: 'PM001', from_date: '2026-10-27', to_date: '2026-10-30', working_days: 4, status: 'L1_REVIEW', reason: 'Medical follow-up', is_lwp: false, allocations: [{ code: 'CL', name: 'Casual Leave', days: 2 }, { code: 'SL', name: 'Sick Leave', days: 2 }] },
  ],
  notifications: [
    { id: 'n-1', title: 'Leave request received', body: 'Your request is awaiting manager review.', created_at: new Date().toISOString(), read_at: null },
    { id: 'n-2', title: 'Holiday calendar updated', body: 'Three company holidays are visible now.', created_at: new Date(Date.now() - 86400000).toISOString(), read_at: new Date().toISOString() },
  ],
  today: {
    date: new Date().toISOString().slice(0, 10),
    record: { check_in_at: new Date().toISOString(), check_out_at: null, status: 'PRESENT' },
    day_type: 'WORKING_DAY',
  },
  holidays: [
    { id: 'h-1', date: '2026-10-22', name: 'Gandhi Jayanti', type: 'national' },
    { id: 'h-2', date: '2026-11-14', name: 'Children’s Day', type: 'optional' },
    { id: 'h-3', date: '2026-12-25', name: 'Christmas', type: 'national' },
  ],
  balances: [
    { code: 'CL', name: 'Casual Leave', balance: 8, allocated: 12 },
    { code: 'SL', name: 'Sick Leave', balance: 6, allocated: 8 },
    { code: 'CO', name: 'Comp Off', balance: 3, allocated: 12 },
  ],
  employees: [
    { id: 'emp-1', name: 'Damnsunny Demo', emp_code: 'PM001', email: 'admin@pmcore.local', department: 'PM Core', joining_date: '2023-01-10', role: 'EMPLOYEE', is_active: true },
    { id: 'emp-2', name: 'Aditi Sharma', emp_code: 'PM002', email: 'aditi@pmcore.local', department: 'PM Core', joining_date: '2024-02-12', role: 'EMPLOYEE', is_active: true },
    { id: 'emp-3', name: 'Nikhil Verma', emp_code: 'PM003', email: 'nikhil@pmcore.local', department: 'PM Core', joining_date: '2024-03-17', role: 'EMPLOYEE', is_active: true },
    { id: 'mgr-1', name: 'Rakesh Menon', emp_code: 'PM100', email: 'rakesh@pmcore.local', department: 'PM Core', joining_date: '2022-11-01', role: 'MANAGER', is_active: true },
    { id: 'adm-1', name: 'Sonia Mehra', emp_code: 'PM101', email: 'sonia@pmcore.local', department: 'PM Core', joining_date: '2022-09-10', role: 'ADMIN', is_active: true },
  ],
  report: {
    lwp: { applications: 2, days: 4 },
    byType: [
      { code: 'CL', name: 'Casual Leave', used: 12, pending: 5 },
      { code: 'SL', name: 'Sick Leave', used: 8, pending: 2 },
      { code: 'CO', name: 'Comp Off', used: 1, pending: 0 },
    ],
    byDepartment: [{ department: 'PM Core', approved: 18, days: 12 }],
  },
};

const demoCall = async (path, opts = {}) => {
  const method = (opts.method || 'GET').toUpperCase();
  const body = opts.body ? JSON.parse(opts.body) : null;

  if (path === '/auth/login' && method === 'POST') {
    return { accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token', user: demoData.user };
  }

  if (path === '/dashboard' && method === 'GET') {
    return demoData.dashboard;
  }

  if (path === '/applications' && method === 'GET') {
    return demoData.apps;
  }

  if (path === '/notifications' && method === 'GET') {
    return demoData.notifications;
  }

  if (path === '/attendance/today' && method === 'GET') {
    return demoData.today;
  }

  if (path === '/employees' && method === 'GET') {
    return demoData.employees.filter((e) => e.role === 'EMPLOYEE');
  }

  if (path === '/managers' && method === 'GET') {
    return demoData.employees.filter((e) => ['MANAGER', 'ADMIN'].includes(e.role));
  }

  if (path === '/balances' && method === 'GET') {
    return demoData.balances;
  }

  if (path === '/holidays' && method === 'GET') {
    return demoData.holidays;
  }

  if (path === '/reports/summary' && method === 'GET') {
    return demoData.report;
  }

  if (path === '/calendar/workdays' && method === 'GET') {
    return { working_days: 4, dates: ['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'] };
  }

  if (path === '/attendance/check-in' && method === 'POST') {
    return { ok: true };
  }

  if (path === '/attendance/check-out' && method === 'POST') {
    return { ok: true };
  }

  if (path === '/applications' && method === 'POST') {
    return { ok: true, created: body };
  }

  if (path === '/notifications/read-all' && method === 'POST') {
    return { ok: true };
  }

  return { ok: true };
};

const getStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem('pm-session') || 'null');
  } catch {
    return null;
  }
};

const saveSession = (session) => {
  localStorage.setItem('pm-session', JSON.stringify(session));
};

async function call(path, opts = {}) {
  const session = getStoredSession();
  const headers = {
    ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(opts.headers || {}),
    ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
  };

  try {
    let response = await fetch(API + path, { ...opts, headers });
    if (response.status === 401 && session?.refreshToken) {
      const refresh = await fetch(API + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
      if (refresh.ok) {
        const next = await refresh.json();
        saveSession({ ...session, ...next });
        response = await fetch(API + path, { ...opts, headers: { ...headers, Authorization: `Bearer ${next.accessToken}` } });
      }
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  } catch (error) {
    return demoCall(path, opts);
  }
}

const day = (d) => d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const short = (d) => d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
const cls = (s) => `status ${String(s || '').toLowerCase().replaceAll('_', '-')}`;
const money = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 1 });

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@pmcore.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const s = await call('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      saveSession(s);
      onLogin(s.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-shell">
      <aside className="login-brand">
        <div className="brand-mark">PM</div>
        <span className="eyebrow">PM CORE · PEOPLE OPERATIONS</span>
        <h1>A clearer way to<br /><em>manage your time.</em></h1>
        <p>Attendance and leave, brought together in one calm workspace for the PM Core team.</p>
        <div className="login-art">
          <div className="art-ring r1" />
          <div className="art-ring r2" />
          <div className="art-card">
            <div className="art-dot" />
            <div><b>Your team, in sync</b><small>Leave plans made visible.</small></div>
            <CheckCircle2 />
          </div>
        </div>
        <small className="login-foot">PRIVATE WORKSPACE · PM CORE DEPARTMENT</small>
      </aside>

      <main className="login-main">
        <div className="login-form">
          <div className="mobile-mark">PM <span>CORE</span></div>
          <span className="eyebrow blue">WELCOME BACK</span>
          <h2>Sign in to PM Core</h2>
          <p className="muted">Use your company account to continue.</p>
          <form onSubmit={submit}>
            <label>Work email
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
            </label>
            <label>Password
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            </label>
            {err && <div className="error-msg"><AlertCircle size={16} />{err}</div>}
            <button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></button>
          </form>
          <div className="login-hint"><ShieldCheck size={17} /><span>Your account is protected with secure sign-in.</span></div>
          <div className="login-demo">Demo credentials: <b>admin@pmcore.local</b> · <b>ChangeMe123!</b></div>
          <div className="copyright">© 2026 PM Core · Attendance & Leave Management · <a href="https://damnsunnyy.github.io/Attendance-Desk/">Live demo</a></div>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(getStoredSession());
  const [page, setPage] = useState('Overview');
  const [data, setData] = useState(demoData.dashboard);
  const [apps, setApps] = useState(demoData.apps);
  const [balances, setBalances] = useState(demoData.balances);
  const [holidays, setHolidays] = useState(demoData.holidays);
  const [notifications, setNotifications] = useState(demoData.notifications);
  const [report, setReport] = useState(demoData.report);
  const [todayAtt, setTodayAtt] = useState(demoData.today);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  const user = session?.user || demoData.user;
  const admin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
  const canReview = admin || user.role === 'MANAGER';

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  async function load() {
    setLoading(true);
    try {
      const [dashboard, allApps, allNotifications, today] = await Promise.all([
        call('/dashboard'),
        call('/applications'),
        call('/notifications'),
        call('/attendance/today'),
      ]);
      setData(dashboard);
      setApps(allApps);
      setNotifications(allNotifications);
      setTodayAtt(today);

      if (admin) {
        const [allEmployees, allManagers, allBalances, allHolidays, summary] = await Promise.all([
          call('/employees'),
          call('/managers'),
          call('/balances'),
          call('/holidays'),
          call('/reports/summary'),
        ]);
        setBalances(allBalances);
        setHolidays(allHolidays);
        setReport(summary);
      }
    } catch (error) {
      flash(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user?.id]);

  async function logout() {
    try {
      await call('/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('pm-session');
    setSession(null);
  }

  const visibleApps = useMemo(() =>
    apps.filter((a) => `${a.employee_name} ${a.emp_code} ${a.status} ${a.reason}`.toLowerCase().includes(search.toLowerCase())),
    [apps, search],
  );

  if (!session) {
    return <Login onLogin={(u) => { setSession({ accessToken: 'demo-access-token', refreshToken: 'demo-refresh-token', user: u }); setPage('Overview'); }} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-row">
          <div className="brand-mark small">PM</div>
          <div className="brand-name">PM CORE<span>PEOPLE OPERATIONS</span></div>
        </div>

        <div className="workspace">
          <div className="workspace-icon">P</div>
          <div><b>PM Core</b><small>Department workspace</small></div>
        </div>

        <nav>
          {['Overview', 'Attendance', 'My requests', 'Leave calendar', 'Notifications'].map((item) => (
            <button className={`nav-item ${page === item ? 'active' : ''}`} key={item} onClick={() => setPage(item)}>
              {item === 'Overview' && <Activity size={18} />}
              {item === 'Attendance' && <Clock3 size={18} />}
              {item === 'My requests' && <ClipboardList size={18} />}
              {item === 'Leave calendar' && <CalendarDays size={18} />}
              {item === 'Notifications' && <Bell size={18} />}
              <span>{item}</span>
            </button>
          ))}
          {admin && (
            <>
              <button className={`nav-item ${page === 'Balances' ? 'active' : ''}`} onClick={() => setPage('Balances')}><Wallet size={18} /><span>Balances</span></button>
              <button className={`nav-item ${page === 'Reports' ? 'active' : ''}`} onClick={() => setPage('Reports')}><Activity size={18} /><span>Reports</span></button>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button className="profile-row" onClick={() => setPage('Overview')}>
            <div className="avatar">{user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>
            <div className="profile-copy"><b>{user.name}</b><small>{user.role.replace('_', ' ')}</small></div>
            <Menu size={19} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> <b>{page}</b></div>
          <div className="top-actions">
            <div className="today-label"><CalendarDays size={16} />{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <button className="icon-btn notification-btn" onClick={() => setPage('Notifications')}><Bell size={19} />{notifications.some((n) => !n.read_at) && <i />}</button>
            <button className="logout-btn" onClick={logout} title="Sign out"><LogOut size={17} /></button>
          </div>
        </header>

        <div className="content">
          {loading && <div className="loading-line" />}

          {page === 'Overview' && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">YOUR WORKSPACE</div>
                  <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]}</h1>
                  <p>Here’s what’s happening across PM Core today.</p>
                </div>
                <button className="primary"><Plus size={17} /> New leave request</button>
              </div>

              <div className="stats-grid">
                <Stat icon={Clock3} label="Requests pending" value={String((data?.counts || []).reduce((sum, item) => sum + (['PENDING', 'L1_REVIEW', 'L2_REVIEW'].includes(item.status) ? item.count : 0), 0))} tone="blue" hint="Awaiting review" />
                <Stat icon={CalendarCheck} label="Approved this period" value={String((data?.counts || []).find((x) => x.status === 'APPROVED')?.count || 0)} tone="green" hint="Approved leave requests" />
                <Stat icon={Wallet} label="Available leave" value={money((data?.balances || []).reduce((sum, item) => sum + Number(item.balance || 0), 0))} tone="purple" hint="Days across leave types" />
                <Stat icon={Users} label="PM Core team" value={String(data?.people?.active || '—')} tone="orange" hint="Active employees" />
              </div>

              <div className="dashboard-grid">
                <section className="panel recent-panel">
                  <div className="panel-head"><div><h3>Recent requests</h3><p>Latest leave activity</p></div></div>
                  <table>
                    <thead><tr><th>EMPLOYEE</th><th>DATES</th><th>TYPE</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {apps.slice(0, 4).map((a) => (
                        <tr key={a.id}>
                          <td>{a.employee_name}</td>
                          <td>{short(a.from_date)} – {short(a.to_date)}</td>
                          <td>{a.is_lwp ? 'LWP' : 'Leave'}</td>
                          <td><span className={cls(a.status)}>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section className="panel balance-panel">
                  <div className="panel-head"><div><h3>Leave balances</h3><p>Available days this period</p></div></div>
                  <div className="balance-list">
                    {(balances || []).map((b) => (
                      <div className="balance-item" key={b.code}>
                        <div className={`balance-icon ${b.code.toLowerCase()}`}>{b.code === 'CL' ? 'C' : b.code === 'SL' ? 'S' : '+'}</div>
                        <div className="balance-name"><b>{b.name}</b></div>
                        <div className="balance-number"><b>{money(b.balance)}</b><small>of {money(b.allocated)} d</small></div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}

          {page === 'Attendance' && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">TIME & ATTENDANCE</div>
                  <h1>My attendance</h1>
                  <p>Record your workday and review attendance activity for this month.</p>
                </div>
                <button className="secondary-btn"><Download size={15} /> Export</button>
              </div>

              <div className="attendance-hero">
                <div className="att-icon"><Clock3 size={22} /></div>
                <div className="att-summary">
                  <small>TODAY · {day(todayAtt?.date)}</small>
                  <h2>{todayAtt?.record?.check_in_at ? 'You are checked in' : 'Start your workday'}</h2>
                  <p>{todayAtt?.record?.check_in_at ? `Checked in at ${new Date(todayAtt.record.check_in_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Check in once you begin work.'}</p>
                </div>
                <div className="att-buttons">
                  <button className="primary" onClick={async () => { await call('/attendance/check-in', { method: 'POST' }); flash('Checked in'); }}><CheckCircle2 size={16} /> Check in</button>
                  <button className="secondary-btn" onClick={async () => { await call('/attendance/check-out', { method: 'POST' }); flash('Checked out'); }}><LogOut size={16} /> Check out</button>
                </div>
              </div>
            </>
          )}

          {page === 'My requests' && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">LEAVE MANAGEMENT</div>
                  <h1>Leave requests</h1>
                  <p>Track your applications and stay up to date on each decision.</p>
                </div>
                <button className="primary"><Plus size={17} /> New request</button>
              </div>
              <section className="panel request-panel">
                <div className="list-toolbar">
                  <div className="searchbox"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your requests" /></div>
                </div>
                <table>
                  <thead><tr><th>DATES</th><th>DAYS</th><th>LEAVE TYPE</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {visibleApps.map((a) => (
                      <tr key={a.id}>
                        <td>{day(a.from_date)} – {day(a.to_date)}</td>
                        <td>{a.working_days} days</td>
                        <td>{a.is_lwp ? 'LWP' : 'Leave'}</td>
                        <td><span className={cls(a.status)}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {page === 'Leave calendar' && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">TIME & PLANNING</div>
                  <h1>Leave calendar</h1>
                  <p>See upcoming public holidays and plan time away with your team.</p>
                </div>
              </div>
              <section className="panel holiday-list">
                {holidays.map((h) => (
                  <div className="holiday-row" key={h.id}>
                    <div className="holiday-date"><b>{new Date(`${h.date}T12:00:00`).toLocaleDateString('en-IN', { day: '2-digit' })}</b><small>{new Date(`${h.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</small></div>
                    <div><b>{h.name}</b><small>{h.type === 'national' ? 'National holiday' : 'Optional holiday'}</small></div>
                  </div>
                ))}
              </section>
            </>
          )}

          {page === 'Balances' && admin && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">LEAVE ADMINISTRATION</div>
                  <h1>Leave balances</h1>
                  <p>Review available balances and make adjustments.</p>
                </div>
              </div>
              <section className="panel request-panel">
                <table>
                  <thead><tr><th>EMPLOYEE</th><th>LEAVE TYPE</th><th>ALLOCATED</th><th>AVAILABLE</th></tr></thead>
                  <tbody>
                    {balances.map((b, index) => (
                      <tr key={`${b.code}-${index}`}>
                        <td>Damnsunny Demo</td>
                        <td>{b.name}</td>
                        <td>{money(b.allocated)}</td>
                        <td><b>{money(b.balance)}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {page === 'Reports' && admin && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">TEAM INSIGHTS</div>
                  <h1>Reports</h1>
                  <p>A clear picture of leave usage and team availability.</p>
                </div>
              </div>
              <div className="directory-cards">
                <Stat icon={FileClock} label="Approved LWP cases" value={String(report?.lwp?.applications || 0)} tone="orange" hint={`${money(report?.lwp?.days || 0)} days for payroll`} />
                <Stat icon={CalendarDays} label="Leave types" value={String(report?.byType?.length || 0)} tone="blue" hint="Configured" />
                <Stat icon={Users} label="Departments" value={String(report?.byDepartment?.length || 0)} tone="purple" hint="Included" />
              </div>
            </>
          )}

          {page === 'Notifications' && (
            <>
              <div className="page-head">
                <div>
                  <div className="eyebrow blue">UPDATES</div>
                  <h1>Notifications</h1>
                  <p>Important updates about requests, balances and team activity.</p>
                </div>
                <button className="secondary-btn" onClick={async () => { await call('/notifications/read-all', { method: 'POST' }); flash('All notifications marked read'); }}>Mark all as read</button>
              </div>
              <section className="panel notification-list">
                {notifications.map((n) => (
                  <div className={`notification-row ${!n.read_at ? 'unread' : ''}`} key={n.id}>
                    <div className="notice-symbol"><Bell size={17} /></div>
                    <div className="notice-copy"><b>{n.title}</b><p>{n.body}</p><small>{new Date(n.created_at).toLocaleString('en-IN')}</small></div>
                  </div>
                ))}
              </section>
            </>
          )}
        </div>

        <footer className="app-footer"><span>© 2026 PM Core · Attendance & Leave</span><span>Secure company workspace <ShieldCheck size={14} /></span></footer>
      </main>

      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <b className="stat-value">{value}</b>
      <small>{hint}</small>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
