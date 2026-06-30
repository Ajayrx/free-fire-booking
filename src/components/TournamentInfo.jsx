export default function TournamentInfo({ activeMatch, joinedCount = 0 }) {
  const prizeTiers = [
    { range: '20-24', min: 20, max: 24, w: 1000, r: 500, t3: 100, t4: 0, kill: 10 },
    { range: '25-29', min: 25, max: 29, w: 1000, r: 500, t3: 200, t4: 100, kill: 15 },
    { range: '30-39', min: 30, max: 39, w: 1000, r: 500, t3: 300, t4: 200, kill: 20 },
    { range: '40-48', min: 40, max: 48, w: 1000, r: 500, t3: 400, t4: 300, kill: 50 },
  ];

  // Default settings
  const defaultSettings = {
    ammoLimit: 'YES', throwableLimit: 'YES', ep: '0', vehicles: 'YES',
    airdrop: 'YES', hp: '200', movementSpeed: '100%', jumpHeight: '100%',
    environment: 'DAY', loadout: 'YES', characterSkill: 'YES', gunAttributes: 'YES',
    genericEnemyOutfit: 'NO', friendlyFire: 'NO', preciseAim: 'YES', autoRevival: 'NO',
    zoneShrinkSpeed: 'STANDARD', outOfZoneDamage: 'STANDARD', quitOutPenalty: 'NO',
    headshot: 'NO', warChest: 'YES', revival: 'YES'
  };

  const settings = activeMatch?.settings || defaultSettings;
  const entryFee = activeMatch?.prizeConfig?.entryFee || 100;
  
  let activeTier;
  let totalPrizePool;

  if (joinedCount < 20) {
    // Default state to entice players when < 20
    activeTier = prizeTiers[prizeTiers.length - 1]; // 40-48 tier
    totalPrizePool = 4500;
  } else {
    // Dynamic pricing starts at 20 players
    activeTier = prizeTiers.find(t => joinedCount >= t.min && joinedCount <= t.max) || prizeTiers[prizeTiers.length - 1];
    totalPrizePool = joinedCount * entryFee;
  }

  const sList = [
    { l: 'AMMO LIMIT', v: settings.ammoLimit },
    { l: 'THROWABLE LIMIT', v: settings.throwableLimit },
    { l: 'EP', v: settings.ep },
    { l: 'VEHICLES', v: settings.vehicles },
    { l: 'AIRDROP', v: settings.airdrop },
    { l: 'HP', v: settings.hp },
    { l: 'MOVEMENT SPEED', v: settings.movementSpeed },
    { l: 'JUMP HEIGHT', v: settings.jumpHeight },
    { l: 'ENVIRONMENT', v: settings.environment },
    { l: 'LOADOUT', v: settings.loadout },
    { l: 'CHARACTER SKILL', v: settings.characterSkill },
    { l: 'GUN ATTRIBUTES', v: settings.gunAttributes },
    { l: 'GENERIC ENEMY OUTFIT', v: settings.genericEnemyOutfit },
    { l: 'FRIENDLY FIRE', v: settings.friendlyFire },
    { l: 'PRECISE AIM', v: settings.preciseAim },
    { l: 'AUTO REVIVAL', v: settings.autoRevival },
    { l: 'ZONE SHRINK SPEED', v: settings.zoneShrinkSpeed },
    { l: 'OUT-OF-ZONE DAMAGE', v: settings.outOfZoneDamage },
    { l: 'QUIT-OUT PENALTY', v: settings.quitOutPenalty },
    { l: 'HEADSHOT', v: settings.headshot },
    { l: 'WAR CHEST', v: settings.warChest },
    { l: 'REVIVAL', v: settings.revival },
  ];

  const col1 = sList.filter((_, i) => i % 2 === 0);
  const col2 = sList.filter((_, i) => i % 2 !== 0);

  return (
    <div className="scrollable-panel" style={{ height: 'calc(100vh - 120px)', paddingRight: '8px' }}>
      
      {/* Section 1 & 2: Prize Pool & Entry Fee */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: 'var(--gold-light)', border: '2px solid var(--gold-primary)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 'bold', marginBottom: '4px' }}>PRIZE POOL</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#92400E' }}>₹{totalPrizePool}</div>
        </div>
        <div style={{ flex: 1, background: '#F3F4F6', border: '2px solid #E5E7EB', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'bold', marginBottom: '4px' }}>ENTRY FEE</div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#111827' }}>₹{entryFee}</div>
        </div>
      </div>

      {/* Section 3: Prize Breakdown */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>Prize Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', fontWeight: 'bold' }}>
            <span style={{ color: '#D97706' }}>Champion 🏆</span><span style={{ color: '#92400E' }}>₹{activeTier.w}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 'bold' }}>
            <span style={{ color: '#4B5563' }}>Runner-up 🥈</span><span style={{ color: '#1F2937' }}>₹{activeTier.r}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 'bold' }}>
            <span style={{ color: '#4B5563' }}>3rd Place 🥉</span><span style={{ color: '#1F2937' }}>₹{activeTier.t3}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 'bold' }}>
            <span style={{ color: '#4B5563' }}>4th Place 🎖️</span><span style={{ color: '#1F2937' }}>₹{activeTier.t4}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', fontWeight: 'bold' }}>
            <span style={{ color: '#DC2626' }}>Per Kill 🔥</span><span style={{ color: '#991B1B' }}>₹{activeTier.kill}</span>
          </div>
        </div>
      </div>

      {/* Section 4: Map Information */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ position: 'relative', height: '140px', background: '#ccc' }}>
          <picture style={{ width: '100%', height: '100%' }}>
            <source srcSet="/bermuda.webp" type="image/webp" />
            <img src="/bermuda.png" alt="Bermuda Classic" fetchPriority="high" loading="eager" decoding="sync" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </picture>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '800' }}>MAP: BERMUDA CLASSIC</h3>
          </div>
        </div>
      </div>

      {/* Section 5: Game Settings */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px' }}>Game Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {col1.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6B7280', fontWeight: 'bold' }}>{s.l}</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{s.v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {col2.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6B7280', fontWeight: 'bold' }}>{s.l}</span>
                <span style={{ color: '#111827', fontWeight: 'bold' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 6: Prize Distribution Table */}
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#1F2937', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Prize Distribution</h3>
        <p style={{ margin: '0 0 12px 0', color: '#6B7280', fontSize: '11px' }}>
          * Winner prize remains fixed at ₹1000. Other rewards scale dynamically based on player participation.
        </p>
        
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '11px' }}>
            <thead style={{ background: '#F3F4F6', color: '#4B5563', fontWeight: 'bold' }}>
              <tr>
                <th style={{ padding: '8px 2px', borderBottom: '2px solid #E5E7EB' }}>Players</th>
                <th style={{ padding: '8px 2px', borderBottom: '2px solid #E5E7EB' }}>Win</th>
                <th style={{ padding: '8px 2px', borderBottom: '2px solid #E5E7EB' }}>2nd</th>
                <th style={{ padding: '8px 2px', borderBottom: '2px solid #E5E7EB' }}>3rd</th>
                <th style={{ padding: '8px 2px', borderBottom: '2px solid #E5E7EB' }}>4th</th>
                <th style={{ padding: '8px 2px', borderBottom: '2px solid #E5E7EB' }}>Kill</th>
              </tr>
            </thead>
            <tbody>
              {prizeTiers.map((tier, idx) => {
                const isActive = activeTier.range === tier.range;
                return (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid #E5E7EB', 
                    background: isActive ? '#FEF3C7' : 'white',
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive ? '#B45309' : '#1F2937'
                  }}>
                    <td style={{ padding: '8px 2px' }}>{tier.range}</td>
                    <td style={{ padding: '8px 2px' }}>₹{tier.w}</td>
                    <td style={{ padding: '8px 2px' }}>₹{tier.r}</td>
                    <td style={{ padding: '8px 2px' }}>₹{tier.t3}</td>
                    <td style={{ padding: '8px 2px' }}>₹{tier.t4}</td>
                    <td style={{ padding: '8px 2px' }}>₹{tier.kill}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
