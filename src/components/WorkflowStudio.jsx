import React, { useState } from 'react';
import './WorkflowStudio.css';

const WORKFLOW_STAGES = [
  {
    step: '01',
    title: 'Import Composition',
    tag: 'Direct AE Comp Lock',
    summary: 'Select your active composition in Adobe After Effects. Zero Velocity locks onto your composition frame rate (24, 30, or 60 fps) and active voice audio track automatically.',
    badge: 'Timecode Locked',
    visualType: 'audio',
    details: [
      { label: 'Frame Rate', value: 'Auto-detects 24, 29.97, 30, 60 fps' },
      { label: 'Audio Detection', value: '48 kHz / 44.1 kHz Active Comp Audio' },
      { label: 'Setup Time', value: 'Instant · Zero configuration' }
    ]
  },
  {
    step: '02',
    title: 'Transcribe Speech',
    tag: '100% On-Device Whisper',
    summary: 'Transcribe speech with fast, private on-device Whisper recognition. Supports English and Roman Hinglish (Hindi bolo, Roman captions pao), or import existing .SRT subtitle files.',
    badge: 'Zero Cloud Latency',
    visualType: 'transcript',
    details: [
      { label: 'Privacy', value: '100% Local (No audio uploaded to cloud)' },
      { label: 'Language', value: 'English + Casual Roman Hinglish' },
      { label: 'Timestamps', value: 'Frame-accurate word timestamps' }
    ]
  },
  {
    step: '03',
    title: 'Choose Caption Style',
    tag: '6 Calibrated Styles',
    summary: 'Select from 6 signature layouts (Balanced, Corporate Clean, Progressive Line, Simple Line, Clean Caption, Devin Style) with calibrated typography pairings.',
    badge: 'Typography Authority',
    visualType: 'style',
    details: [
      { label: 'Layouts', value: '6 Production Styles' },
      { label: 'Typography', value: 'Tactic Sans, Syne, Garamond, Inter' },
      { label: 'Customization', value: 'Word count pacing & casing control' }
    ]
  },
  {
    step: '04',
    title: 'Animate & Sync Sound',
    tag: '10 Presets · 5 SFX Cues',
    summary: 'Apply from 10 entrance animations targeting Words or Lines. Assign Support, Hero, and Accent word roles, and automatically sync 5 built-in SFX cues to keyframe hits.',
    badge: 'Motion & Sound',
    visualType: 'motion',
    details: [
      { label: 'Animations', value: '10 Kinetic entrance presets' },
      { label: 'Sound FX', value: '5 Built-in audio cues locked to hits' },
      { label: 'Role Tagging', value: 'One-click Hero & Accent word tagging' }
    ]
  },
  {
    step: '05',
    title: 'Generate Native AE Layers',
    tag: '100% Vector Text Layers',
    summary: 'Zero Velocity generates genuine, keyframed Adobe After Effects text layers and shape elements directly onto your active timeline. Fully editable, infinite resolution.',
    badge: 'Native Timeline',
    visualType: 'generate',
    details: [
      { label: 'Layer Type', value: 'Native Adobe AE Text & Shape Layers' },
      { label: 'Editability', value: '100% Editable in standard AE timeline' },
      { label: 'Quality', value: 'Infinite vector resolution (no flat video)' }
    ]
  }
];

export default function WorkflowStudio() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const activeStage = WORKFLOW_STAGES[activeStageIndex];

  return (
    <section id="workflow" className="workflow-studio-section">
      <div className="container">
        {/* Section Header */}
        <div className="workflow-header text-center">
          <div className="workflow-eyebrow">
            <span className="workflow-dot" aria-hidden="true"></span>
            <span>PRODUCTION SEQUENCE</span>
          </div>
          <h2 className="workflow-title">
            From Raw Audio to Timeline Captions<br />
            <span className="workflow-title-accent">in 5 Connected Stages.</span>
          </h2>
          <p className="workflow-subtitle">
            One fluid pipeline directly inside Adobe After Effects. No browser tabs, no cloud render queues, no export-import friction.
          </p>
        </div>

        {/* Connected Timeline Navigation Rail */}
        <div className="workflow-timeline-rail" role="tablist" aria-label="Workflow Stage Selector">
          <div className="timeline-connecting-line" aria-hidden="true">
            <div
              className="timeline-progress-fill"
              style={{ width: `${(activeStageIndex / (WORKFLOW_STAGES.length - 1)) * 100}%` }}
            ></div>
          </div>

          {WORKFLOW_STAGES.map((stage, idx) => {
            const isSelected = idx === activeStageIndex;
            const isPassed = idx <= activeStageIndex;
            return (
              <button
                key={stage.step}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`stage-panel-${stage.step}`}
                id={`stage-tab-${stage.step}`}
                className={`timeline-node-btn ${isSelected ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => setActiveStageIndex(idx)}
              >
                <div className="node-marker">
                  <span className="node-number">{stage.step}</span>
                </div>
                <div className="node-meta">
                  <span className="node-title">{stage.title}</span>
                  <span className="node-tag">{stage.tag}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Editorial Showcase Stage */}
        <div
          className="workflow-stage-card"
          id={`stage-panel-${activeStage.step}`}
          role="tabpanel"
          aria-labelledby={`stage-tab-${activeStage.step}`}
        >
          {/* Left Column: Stage Explanation & Specs */}
          <div className="stage-explanation-col">
            <div className="stage-header-row">
              <span className="stage-index-badge">STAGE {activeStage.step} OF 05</span>
              <span className="stage-status-pill">{activeStage.badge}</span>
            </div>

            <h3 className="stage-heading">{activeStage.title}</h3>
            <p className="stage-summary">{activeStage.summary}</p>

            <div className="stage-specs-grid">
              {activeStage.details.map((d, i) => (
                <div key={i} className="spec-row">
                  <span className="spec-k">{d.label}</span>
                  <span className="spec-v">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Authentic Transformation Visual Evidence */}
          <div className="stage-visual-col" aria-label="Workflow Evidence Preview">
            <div className="visual-terminal-chrome">
              <div className="vt-traffic-dots" aria-hidden="true">
                <span className="vt-dot dot-red"></span>
                <span className="vt-dot dot-yellow"></span>
                <span className="vt-dot dot-green"></span>
              </div>
              <span className="vt-title">Zero Velocity CEP Pipeline · Stage {activeStage.step}</span>
            </div>

            <div className="visual-stage-canvas">
              {activeStage.visualType === 'audio' && (
                <div className="vt-content vt-audio-stage">
                  <div className="audio-lock-pill">✓ AE COMP POSITION LOCKED · 29.97 FPS</div>
                  <div className="audio-wave-bars">
                    {[35, 60, 90, 45, 100, 75, 40, 85, 95, 60, 30, 85, 100, 70, 50, 95, 45, 80].map((h, i) => (
                      <span key={i} className="wave-bar-item" style={{ height: `${h}%` }}></span>
                    ))}
                  </div>
                  <span className="vt-caption-sub">Active VO Audio Track Detected (48kHz Stereo)</span>
                </div>
              )}

              {activeStage.visualType === 'transcript' && (
                <div className="vt-content vt-transcript-stage">
                  <div className="transcript-box">
                    <span className="ts-time">[00:01:12]</span>
                    <span className="ts-text">"Turn raw speech into styled captions..."</span>
                  </div>
                  <div className="transcript-box active">
                    <span className="ts-time">[00:02:18]</span>
                    <span className="ts-text highlight">"without leaving Adobe After Effects."</span>
                  </div>
                  <div className="transcript-status">
                    <span className="pulse-dot"></span>
                    <span>100% On-Device Whisper · Zero Cloud Delay</span>
                  </div>
                </div>
              )}

              {activeStage.visualType === 'style' && (
                <div className="vt-content vt-style-stage">
                  <div className="style-demo-card">
                    <span className="style-lead-font">BALANCED KINETIC STACK</span>
                    <h4 className="style-hero-font">MAKE EVERY WORD LAND</h4>
                  </div>
                  <div className="style-meta-row">
                    <span className="style-tag-chip">Syne ExtraBold + Garamond</span>
                    <span className="style-tag-chip">3 Words Pacing</span>
                  </div>
                </div>
              )}

              {activeStage.visualType === 'motion' && (
                <div className="vt-content vt-motion-stage">
                  <div className="keyframes-strip">
                    <span className="kf-point kf-1">◆ POP IN</span>
                    <span className="kf-point kf-2">◆ BEZIER EASE</span>
                    <span className="kf-point kf-3 active">🔔 SFX HIT LOCK</span>
                  </div>
                  <div className="motion-role-tags">
                    <span className="role-tag-item role-support">SUPPORT</span>
                    <span className="role-tag-item role-hero">HERO</span>
                    <span className="role-tag-item role-accent">ACCENT</span>
                  </div>
                </div>
              )}

              {activeStage.visualType === 'generate' && (
                <div className="vt-content vt-generate-stage">
                  <div className="ae-layer-bar">
                    <span className="ae-icon-chip">Ae</span>
                    <span className="ae-layer-title">[Layer 1] Zero Velocity Caption Layer</span>
                    <span className="ae-layer-type">Text Layer</span>
                  </div>
                  <div className="ae-layer-bar sub">
                    <span className="ae-icon-chip shape">■</span>
                    <span className="ae-layer-title">[Layer 2] Caption Accent Highlight Shape</span>
                    <span className="ae-layer-type">Shape Layer</span>
                  </div>
                  <div className="generate-success-badge">
                    <span>✓ 100% Vector Keyframed Timeline Layers Built</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
