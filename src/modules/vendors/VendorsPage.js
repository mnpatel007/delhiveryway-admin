import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../core/utils/axios';
import './VendorsPage.css';

// Accounts created through Google carry a placeholder rather than a real
// number, and showing '0000000000' reads as data when it is the absence of it.
const PLACEHOLDER_PHONES = ['0000000000', '1111111111', '1234567890', '9999999999'];
const prettyPhone = (phone) =>
  !phone || PLACEHOLDER_PHONES.includes(String(phone)) ? 'No phone number' : phone;

const STATUS_LABEL = {
  unverified: 'Email not verified',
  'awaiting-code': 'Needs a code',
  'code-issued': 'Code sent',
  linked: 'Connected',
};

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Which vendor's "issue a code" panel is open, and the shop picked for them.
  const [issuingFor, setIssuingFor] = useState(null);
  const [chosenShop, setChosenShop] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(null); // { code, shopName, expiresAt, emailed }

  const load = useCallback(async () => {
    try {
      setError('');
      const [v, s] = await Promise.all([
        axiosInstance.get('/admin/vendors'),
        axiosInstance.get('/admin/vendors/unclaimed-shops'),
      ]);
      setVendors(v.data?.data?.vendors || []);
      setShops(s.data?.data?.shops || []);
    } catch (err) {
      console.error('Error loading vendors:', err);
      setError('Could not load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openIssue = (vendor) => {
    setIssuingFor(vendor);
    setIssued(null);
    // Pre-select the shop whose name best matches what they typed at signup.
    const wanted = (vendor.requestedShopName || '').toLowerCase().trim();
    const guess = wanted ? shops.find((s) => s.name.toLowerCase().trim() === wanted) : null;
    setChosenShop(guess ? guess._id : '');
  };

  const issueCode = async () => {
    if (!chosenShop) return;
    setBusy(true);
    try {
      const res = await axiosInstance.post(`/admin/vendors/${issuingFor._id}/claim-code`, {
        shopId: chosenShop,
      });
      setIssued(res.data?.data || null);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not issue the code.');
    } finally {
      setBusy(false);
    }
  };

  const revokeCode = async (vendor) => {
    if (!window.confirm(`Revoke the outstanding code for ${vendor.name}?`)) return;
    try {
      const res = await axiosInstance.delete(`/admin/vendors/${vendor._id}/claim-code`);
      alert(res.data?.message || 'Revoked.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not revoke.');
    }
  };

  const unlink = async (vendor) => {
    if (
      !window.confirm(
        `Disconnect ${vendor.name} from ${vendor.shop?.name}?\n\nThey keep partner access and can be connected to another shop. The shop becomes claimable again.`
      )
    )
      return;
    try {
      const res = await axiosInstance.delete(`/admin/vendors/${vendor._id}/shop`);
      alert(res.data?.message || 'Unlinked.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not unlink.');
    }
  };

  // Takes the vendor capability away but keeps the person's account, since a
  // shop owner is usually a customer of ours as well.
  const revokeAccess = async (vendor) => {
    const runs = vendor.shop ? ` and disconnect them from ${vendor.shop.name}` : '';
    if (
      !window.confirm(
        `Remove partner access for ${vendor.name}?\n\nThis revokes their shop access${runs}, cancels any outstanding code, and clears their application.\n\nTheir account stays, and they can still sign in and order as a customer.`
      )
    )
      return;
    try {
      const res = await axiosInstance.delete(`/admin/vendors/${vendor._id}/access`);
      alert(res.data?.message || 'Access removed.');
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not remove access.');
    }
  };

  const counts = vendors.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {});

  const visible = vendors.filter((v) => {
    if (filter !== 'all' && v.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.includes(q) ||
      v.requestedShopName?.toLowerCase().includes(q) ||
      v.shop?.name?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="vendors-page loading-container">
        <div className="spinner" />
        <p>Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="vendors-page">
      <div className="page-header-container">
        <Link to="/dashboard" className="back-link">
          <span>&larr;</span> Back to Dashboard
        </Link>
        <div className="page-header">
          <h1>Vendors</h1>
          <button className="refresh-btn" onClick={load}>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="vendors-error">{error}</div>}

      <div className="vendor-stats">
        {[
          ['all', 'All vendors', vendors.length],
          ['awaiting-code', 'Waiting for a code', counts['awaiting-code'] || 0],
          ['code-issued', 'Code sent', counts['code-issued'] || 0],
          ['linked', 'Connected', counts.linked || 0],
          ['unverified', 'Email unverified', counts.unverified || 0],
        ].map(([key, label, n]) => (
          <button
            key={key}
            className={`vstat ${filter === key ? 'active' : ''} ${key}`}
            onClick={() => setFilter(key)}
          >
            <span className="vstat-n">{n}</span>
            <span className="vstat-label">{label}</span>
          </button>
        ))}
      </div>

      <input
        className="vendor-search"
        placeholder="Search by name, email, phone or shop..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {visible.length === 0 ? (
        <div className="vendors-empty">
          <h3>Nothing here</h3>
          <p>
            {vendors.length === 0
              ? 'No one has signed up as a vendor yet. They appear here as soon as they register on the partner portal.'
              : 'No vendor matches this filter.'}
          </p>
        </div>
      ) : (
        <div className="vendor-list">
          {visible.map((v) => (
            <div key={v._id} className={`vendor-card ${v.status}`}>
              <div className="vc-main">
                <div className="vc-identity">
                  <h3>{v.name}</h3>
                  <span className={`vc-badge ${v.status}`}>
                    {STATUS_LABEL[v.status] || v.status}
                  </span>
                </div>
                <div className="vc-meta">
                  <span>{v.email}</span>
                  <span className={prettyPhone(v.phone) === 'No phone number' ? 'vc-nophone' : ''}>
                    {prettyPhone(v.phone)}
                  </span>
                  <span>Joined {new Date(v.createdAt).toLocaleDateString('en-IN')}</span>
                  {v.customerOrders > 0 && (
                    <span className="vc-orders">
                      {v.customerOrders} order{v.customerOrders === 1 ? '' : 's'} as a customer
                    </span>
                  )}
                </div>
                <div className="vc-shop">
                  {v.shop ? (
                    <>
                      Runs <strong>{v.shop.name}</strong>
                    </>
                  ) : v.requestedShopName ? (
                    <>
                      Says they run <strong>{v.requestedShopName}</strong>
                    </>
                  ) : (
                    <em>No shop name given at signup</em>
                  )}
                </div>
                {v.pendingCode && (
                  <div className="vc-pending">
                    Code for <strong>{v.pendingCode.shopName}</strong> sent{' '}
                    {new Date(v.pendingCode.issuedAt).toLocaleDateString('en-IN')} &middot; expires{' '}
                    {new Date(v.pendingCode.expiresAt).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>

              <div className="vc-actions">
                {v.shop ? (
                  <button className="btn ghost" onClick={() => unlink(v)}>
                    Disconnect shop
                  </button>
                ) : (
                  <>
                    <button className="btn primary" onClick={() => openIssue(v)}>
                      {v.pendingCode ? 'Issue a new code' : 'Issue code'}
                    </button>
                    {v.pendingCode && (
                      <button className="btn ghost" onClick={() => revokeCode(v)}>
                        Revoke code
                      </button>
                    )}
                  </>
                )}

                <button className="btn danger" onClick={() => revokeAccess(v)}>
                  Remove access
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {issuingFor && (
        <div className="issue-overlay" onClick={() => !busy && setIssuingFor(null)}>
          <div className="issue-modal" onClick={(e) => e.stopPropagation()}>
            {issued ? (
              <>
                <h2>Code issued</h2>
                <p className="issue-sub">
                  For <strong>{issued.shopName}</strong>, valid until{' '}
                  {new Date(issued.expiresAt).toLocaleDateString('en-IN')}.
                </p>
                <div className="issue-code">{issued.code}</div>
                <p className={`issue-mail ${issued.emailed ? 'ok' : 'warn'}`}>
                  {issued.emailed
                    ? `Emailed to ${issuingFor.email}.`
                    : 'The email did not send — read this code out to them instead.'}
                </p>
                <p className="issue-note">
                  You will not be able to see this code again. Only a hash of it is stored.
                </p>
                <button
                  className="btn primary wide"
                  onClick={() => {
                    setIssuingFor(null);
                    setIssued(null);
                  }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2>Connect {issuingFor.name} to a shop</h2>
                <p className="issue-sub">
                  {issuingFor.requestedShopName ? (
                    <>
                      They said they run <strong>{issuingFor.requestedShopName}</strong>. Check that
                      against the list before issuing.
                    </>
                  ) : (
                    'They did not give a shop name at signup, so confirm with them first.'
                  )}
                </p>

                {shops.length === 0 ? (
                  <p className="issue-warn">
                    Every shop already has an owner. Disconnect one first, or add a new shop.
                  </p>
                ) : (
                  <select
                    className="issue-select"
                    value={chosenShop}
                    onChange={(e) => setChosenShop(e.target.value)}
                  >
                    <option value="">Choose a shop...</option>
                    {shops.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}

                <div className="issue-actions">
                  <button className="btn ghost" onClick={() => setIssuingFor(null)} disabled={busy}>
                    Cancel
                  </button>
                  <button
                    className="btn primary"
                    onClick={issueCode}
                    disabled={!chosenShop || busy}
                  >
                    {busy ? 'Issuing...' : 'Issue code'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
