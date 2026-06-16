import React, { useState } from 'react';
import { Share2, Copy, Check, Users, Gift, Star, Award } from 'lucide-react';
import './ReferralCard.css';

export const ReferralCard = () => {
  const [copied, setCopied] = useState(false);
  const developerId = 'dev_kca_8810'; // Mock current developer ID
  const referralLink = `https://code.koneacademy.io/register?ref=${developerId}`;

  // Mock list of referred developers
  const [friends] = useState([
    { id: '1', name: 'Akosua Boateng', status: 'Enrolled', date: '2026-06-08', creditAwarded: 100 },
    { id: '2', name: 'Kofi Mensah', status: 'Enrolled', date: '2026-06-12', creditAwarded: 100 },
    { id: '3', name: 'Ama Agyapong', status: 'Registered', date: '2026-06-15', creditAwarded: 0 }
  ]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const enrolledCount = friends.filter(f => f.status === 'Enrolled').length;
  const totalCredit = friends.reduce((sum, f) => sum + f.creditAwarded, 0);
  const progressPercent = (enrolledCount / 5) * 100;

  return (
    <div className="kco-referral-container">
      {/* 1. Header Banner */}
      <div className="kco-referral-header">
        <div className="kco-referral-icon-badge">
          <Award className="award-pulse" size={28} />
        </div>
        <div className="kco-referral-header-text">
          <h3>Refer a Developer</h3>
          <p>Help peers learn professional coding bootcamps. When they enroll, both of you earn <strong>₵100 tuition credit</strong>!</p>
        </div>
      </div>

      {/* 2. Referral Link Area */}
      <div className="kco-referral-link-section">
        <label className="kco-label">Your Custom Referral Link</label>
        <div className="kco-copy-wrapper">
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="kco-referral-input"
          />
          <button 
            onClick={handleCopy} 
            className={`kco-copy-btn ${copied ? 'copied' : ''}`}
            aria-label="Copy link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 3. Tuition Credit Stats */}
      <div className="kco-stats-grid">
        <div className="kco-stat-box">
          <span className="stat-label">Total Credit Earned</span>
          <span className="stat-val">₵{totalCredit}</span>
        </div>
        <div className="kco-stat-box">
          <span className="stat-label">Referrals Enrolled</span>
          <span className="stat-val">{enrolledCount}</span>
        </div>
      </div>

      {/* 4. Progress Milestones */}
      <div className="kco-referral-progress-section">
        <div className="kco-progress-header">
          <span>Active referrals: <strong>{enrolledCount} / 5</strong></span>
          <span className="kco-badge-milestone"><Star size={14} /> Next Milestone: free API Course</span>
        </div>
        
        <div className="kco-progress-bar-bg">
          <div 
            className="kco-progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
          <div className="kco-milestone-marker m1" style={{ left: '20%' }} title="1 Enrollment: ₵100 Credit"></div>
          <div className="kco-milestone-marker m2" style={{ left: '60%' }} title="3 Enrollments: Free API Course"></div>
          <div className="kco-milestone-marker m3" style={{ left: '100%' }} title="5 Enrollments: Dev Badge"></div>
        </div>
        <div className="kco-progress-labels">
          <span>1 Friend</span>
          <span>3 Friends</span>
          <span>5 Friends</span>
        </div>
      </div>

      {/* 5. Referred Friends List */}
      <div className="kco-referral-tracker-section">
        <h4 className="tracker-title">
          <Users size={16} /> 
          <span>Referred Coders ({friends.length})</span>
        </h4>
        <div className="friends-list">
          {friends.map(friend => (
            <div key={friend.id} className="friend-row">
              <div className="friend-info">
                <span className="friend-name">{friend.name}</span>
                <span className="friend-date">Referred on {friend.date}</span>
              </div>
              <div className="friend-status-badge">
                <span className={`status-dot ${friend.status.toLowerCase()}`}></span>
                <span className="status-text">{friend.status}</span>
                {friend.creditAwarded > 0 && (
                  <span className="reward-tag">
                    🎁 +₵{friend.creditAwarded}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
