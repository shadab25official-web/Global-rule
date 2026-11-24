import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BG = '#090a0d';
const CARD_BG = '#111318';
const BORDER_SUBTLE = 'rgba(255, 255, 255, 0.08)';
const AMBER = '#facc15';
const AMBER_SOFT = 'rgba(250, 204, 21, 0.14)';
const RED = '#ef4444';
const RED_SOFT = 'rgba(239, 68, 68, 0.16)';
const TEXT_MAIN = '#f8fafc';
const TEXT_MUTED = '#94a3b8';

const useEntrance = (startFrame: number, delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - (startFrame + delay));
  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.8 },
  });
  const opacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const translateY = interpolate(progress, [0, 1], [28, 0]);
  return { opacity, translateY, progress };
};

const HudShell: React.FC<{
  startFrame: number;
  durationFrames: number;
  leftTag: string;
  rightTag: string;
  pillText: string;
  pillTone?: 'amber' | 'red';
  bottomText: string;
  bottomTone?: 'amber' | 'red';
  children: React.ReactNode;
}> = ({
  startFrame,
  durationFrames,
  leftTag,
  rightTag,
  pillText,
  pillTone = 'amber',
  bottomText,
  bottomTone = 'amber',
  children,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const fadeIn = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fadeOut = interpolate(
    localFrame,
    [durationFrames - 10, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const sceneOpacity = Math.min(fadeIn, fadeOut);

  const glowPulse = 0.85 + 0.15 * Math.sin(localFrame * 0.08);
  const bottomHighlight = interpolate(
    localFrame,
    [durationFrames * 0.55, durationFrames * 0.78],
    [0.35, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const accentColor = pillTone === 'red' ? RED : AMBER;
  const accentBg = pillTone === 'red' ? RED_SOFT : AMBER_SOFT;
  const bottomColor = bottomTone === 'red' ? RED : AMBER;
  const bottomBg = bottomTone === 'red' ? RED_SOFT : AMBER_SOFT;

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        backgroundColor: BG,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: TEXT_MAIN,
        overflow: 'hidden',
      }}
    >
      {/* Subtle HUD Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Ambient Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '22%',
          left: '50%',
          width: 780,
          height: 780,
          transform: `translate(-50%, -50%) scale(${glowPulse})`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentBg} 0%, rgba(9,10,13,0) 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Top Status Bar */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 56,
          right: 56,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'monospace',
          fontSize: 22,
          letterSpacing: 2,
          color: TEXT_MUTED,
        }}
      >
        <span>{leftTag}</span>
        <span style={{ color: accentColor }}>{rightTag}</span>
      </div>

      {/* Top Center Pill Badge */}
      <div
        style={{
          position: 'absolute',
          top: 132,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            padding: '14px 34px',
            borderRadius: 999,
            backgroundColor: accentBg,
            border: `1.5px solid ${accentColor}`,
            color: accentColor,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2.2,
            textTransform: 'uppercase',
          }}
        >
          {pillText}
        </div>
      </div>

      {/* Center Content Area */}
      <div
        style={{
          position: 'absolute',
          top: 250,
          bottom: 240,
          left: 56,
          right: 56,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>

      {/* Bottom Takeaway / CTA Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: 110,
          left: 56,
          right: 56,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            padding: '20px 36px',
            borderRadius: 999,
            backgroundColor: bottomBg,
            border: `2px solid ${bottomColor}`,
            boxShadow: `0 0 ${28 * bottomHighlight}px ${bottomBg}`,
            opacity: 0.55 + 0.45 * bottomHighlight,
            color: TEXT_MAIN,
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: 1.5,
            textAlign: 'center',
          }}
        >
          {bottomText}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LrsHudReel: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene 1: 0-360 (0-12s) - Annual LRS Limit
  const s1Card = useEntrance(0, 6);

  // Scene 2: 360-720 (12-24s) - Eligibility Rows
  const s2Rows = [
    { label: 'RESIDENT INDIVIDUALS', tag: 'ALLOWED', ok: true },
    { label: 'MINORS (GUARDIAN FORM A2)', tag: 'ALLOWED', ok: true },
    { label: 'CORPORATES & FIRMS', tag: 'EXCLUDED', ok: false },
    { label: 'HUF & TRUSTS', tag: 'EXCLUDED', ok: false },
  ];

  // Scene 3: 720-1080 (24-36s) - Family Clubbing Flow
  const s3Left = useEntrance(720, 6);
  const s3Right = useEntrance(720, 22);
  const s3DashOffset = interpolate(frame - 720, [0, 90], [180, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene 4: 1080-1440 (36-48s) - Bank & Documentation Stack
  const s4Cards = [
    { title: 'PAN MANDATORY', sub: 'Required for LRS remittances' },
    { title: 'FORM A2 + AD BANK', sub: 'Designated branch declaration' },
    { title: '1-YR A/C & SOURCE PROOF', sub: 'Statement / ITR due diligence' },
  ];

  // Scene 5: 1440-1800 (48-60s) - 180-Day Rule & CTA
  const s5Card = useEntrance(1440, 8);
  const wavePhase = frame * 0.09;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* SCENE 1: 00-12s */}
      {frame >= 0 && frame < 360 && (
        <HudShell
          startFrame={0}
          durationFrames={360}
          leftTag="RBI LRS BRIEF"
          rightTag="FY APR–MAR"
          pillText="LRS LIMIT MONITOR"
          pillTone="amber"
          bottomText="OVERSEAS PROPERTY REMITTANCE"
          bottomTone="amber"
        >
          <div
            style={{
              opacity: s1Card.opacity,
              transform: `translateY(${s1Card.translateY}px)`,
              backgroundColor: CARD_BG,
              border: `1.5px solid ${BORDER_SUBTLE}`,
              borderRadius: 28,
              padding: '54px 44px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 24,
                color: AMBER,
                letterSpacing: 3,
                marginBottom: 18,
              }}
            >
              ANNUAL CAP PER FINANCIAL YEAR
            </div>
            <div
              style={{
                fontSize: 82,
                fontWeight: 900,
                color: TEXT_MAIN,
                letterSpacing: -1,
                lineHeight: 1.05,
              }}
            >
              USD 2,50,000
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 28,
                color: TEXT_MUTED,
                fontWeight: 500,
              }}
            >
              Resident Individuals · Capital & Current Account
            </div>
          </div>
        </HudShell>
      )}

      {/* SCENE 2: 12-24s */}
      {frame >= 360 && frame < 720 && (
        <HudShell
          startFrame={360}
          durationFrames={360}
          leftTag="ELIGIBILITY MATRIX"
          rightTag="FEMA LRS"
          pillText="WHO CAN USE LRS?"
          pillTone="red"
          bottomText="INDIVIDUALS ONLY — NO ENTITIES"
          bottomTone="red"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {s2Rows.map((row, idx) => {
              const anim = useEntrance(360, idx * 10);
              const barWidth = interpolate(
                anim.progress,
                [0, 1],
                [0, row.ok ? 100 : 35]
              );
              const toneColor = row.ok ? AMBER : RED;
              return (
                <div
                  key={row.label}
                  style={{
                    opacity: anim.opacity,
                    transform: `translateY(${anim.translateY}px)`,
                    backgroundColor: CARD_BG,
                    border: `1.5px solid ${
                      row.ok ? BORDER_SUBTLE : 'rgba(239,68,68,0.35)'
                    }`,
                    borderRadius: 22,
                    padding: '26px 32px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 14,
                    }}
                  >
                    <span style={{ fontSize: 28, fontWeight: 700 }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 20,
                        fontWeight: 700,
                        padding: '6px 14px',
                        borderRadius: 999,
                        color: toneColor,
                        backgroundColor: row.ok ? AMBER_SOFT : RED_SOFT,
                      }}
                    >
                      {row.tag}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: toneColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </HudShell>
      )}

      {/* SCENE 3: 24-36s */}
      {frame >= 720 && frame < 1080 && (
        <HudShell
          startFrame={720}
          durationFrames={360}
          leftTag="FAMILY CONSOLIDATION"
          rightTag="PARA 4 & 6(II)"
          pillText="FAMILY CLUBBING RULE"
          pillTone="amber"
          bottomText="CHECK CO-OWNERSHIP BEFORE CLUBBING"
          bottomTone="red"
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: '100%',
                opacity: s3Left.opacity,
                transform: `translateY(${s3Left.translateY}px)`,
                backgroundColor: CARD_BG,
                border: `1.5px solid ${BORDER_SUBTLE}`,
                borderRadius: 24,
                padding: '32px 36px',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  color: AMBER,
                  marginBottom: 8,
                }}
              >
                STEP A · CONSOLIDATION
              </div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>
                Family Members Can Club Limits
              </div>
              <div style={{ fontSize: 24, color: TEXT_MUTED, marginTop: 8 }}>
                Each member must meet LRS terms individually
              </div>
            </div>

            {/* Animated Connector */}
            <svg width="80" height="84" viewBox="0 0 80 84">
              <path
                d="M 40 4 C 40 34, 40 50, 40 78"
                stroke={AMBER}
                strokeWidth="4"
                strokeDasharray="10 8"
                strokeDashoffset={s3DashOffset}
                fill="none"
              />
              <circle cx="40" cy="78" r="7" fill={RED} />
            </svg>

            <div
              style={{
                width: '100%',
                opacity: s3Right.opacity,
                transform: `translateY(${s3Right.translateY}px)`,
                backgroundColor: CARD_BG,
                border: '1.5px solid rgba(239,68,68,0.4)',
                borderRadius: 24,
                padding: '32px 36px',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 20,
                  color: RED,
                  marginBottom: 8,
                }}
              >
                STEP B · CAPITAL ACCOUNT CHECK
              </div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>
                Co-Owner / Co-Partner Required
              </div>
              <div style={{ fontSize: 24, color: TEXT_MUTED, marginTop: 8 }}>
                Governed by Overseas Investment Rules, 2022
              </div>
            </div>
          </div>
        </HudShell>
      )}

      {/* SCENE 4: 36-48s */}
      {frame >= 1080 && frame < 1440 && (
        <HudShell
          startFrame={1080}
          durationFrames={360}
          leftTag="AD BANK CONTROLS"
          rightTag="FORM A2 · PAN"
          pillText="REMITTANCE COMPLIANCE"
          pillTone="amber"
          bottomText="NO BANK CREDIT FOR CAPITAL ACCOUNT"
          bottomTone="red"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {s4Cards.map((item, idx) => {
              const anim = useEntrance(1080, idx * 12);
              return (
                <div
                  key={item.title}
                  style={{
                    opacity: anim.opacity,
                    transform: `translateY(${anim.translateY}px)`,
                    backgroundColor: CARD_BG,
                    border: `1.5px solid ${BORDER_SUBTLE}`,
                    borderLeft: `6px solid ${AMBER}`,
                    borderRadius: 22,
                    padding: '30px 34px',
                  }}
                >
                  <div style={{ fontSize: 32, fontWeight: 800 }}>
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      color: TEXT_MUTED,
                      marginTop: 8,
                    }}
                  >
                    {item.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </HudShell>
      )}

      {/* SCENE 5: 48-60s */}
      {frame >= 1440 && frame <= 1800 && (
        <HudShell
          startFrame={1440}
          durationFrames={360}
          leftTag="EXIT & COMPLIANCE"
          rightTag="180-DAY RULE"
          pillText="UNSPENT / REALISED FX"
          pillTone="amber"
          bottomText="SAVE FOR DUBAI / UK / US SERIES"
          bottomTone="amber"
        >
          <div style={{ position: 'relative' }}>
            {/* Flowing Wave Line Behind Card */}
            <svg
              width="968"
              height="260"
              viewBox="0 0 968 260"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.45,
              }}
            >
              <path
                d={`M 0 130 Q 242 ${130 + Math.sin(wavePhase) * 65}, 484 130 T 968 130`}
                stroke={AMBER}
                strokeWidth="3"
                fill="none"
              />
              <path
                d={`M 0 155 Q 242 ${155 - Math.cos(wavePhase) * 55}, 484 155 T 968 155`}
                stroke={RED}
                strokeWidth="2.5"
                fill="none"
              />
            </svg>

            <div
              style={{
                position: 'relative',
                opacity: s5Card.opacity,
                transform: `translateY(${s5Card.translateY}px)`,
                backgroundColor: CARD_BG,
                border: `1.5px solid ${BORDER_SUBTLE}`,
                borderRadius: 28,
                padding: '50px 42px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 22,
                  color: AMBER,
                  letterSpacing: 2.5,
                  marginBottom: 14,
                }}
              >
                REPATRIATION WINDOW
              </div>
              <div style={{ fontSize: 78, fontWeight: 900, lineHeight: 1.05 }}>
                180 DAYS
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 26,
                  color: TEXT_MUTED,
                  lineHeight: 1.35,
                }}
              >
                Unspent / realised foreign exchange rule unless reinvested or
                governed by OI provisions
              </div>
            </div>
          </div>
        </HudShell>
      )}
    </AbsoluteFill>
  );
};
        
