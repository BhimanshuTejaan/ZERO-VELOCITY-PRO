import React, { useState } from 'react';
import './WorkflowStudio.css';

const WORKFLOW_STEPS = [
  {
    id: 'import',
    stepNumber: '01',
    title: 'Import Media',
    tag: 'Direct AE Comp Lock',
    desc: 'Select your active composition in Adobe After Effects. Zero Velocity automatically locks onto your project frame rate (24, 30, or 60 fps) and audio track.',
    inspectorData: {
      composition: 'Comp 1 (1080 × 1920 Reel)',
      framerate: '29.97 fps (Auto-Locked)',
      audioTrack: 'Active VO Track (48kHz Stereo)',
      status: 'Ready for Transcription'
    }
  },
  {
    id: 'transcribe',
    stepNumber: '02',
    title: 'Transcribe Speech',
    tag: 'Offline English + Hinglish',
    desc: 'Run fast on-device speech recognition with English and Roman Hinglish support for complete privacy, or drag in an existing .SRT subtitle file.',
    inspectorData: {
      engine: 'Whisper Local Offline Pipeline',
      languages: 'English + Roman Hinglish',
      privacy: '100% On-Device (No Cloud Uploads)',
      accuracy: 'Frame-Accurate Word Timestamps'
    }
  },
  {
    id: 'style',
    stepNumber: '03',
    title: 'Choose & Style Layout',
    tag: '6 Production Styles',
    desc: 'Choose from 6 signature layouts (Balanced, Corporate Clean, Progressive Line, Simple Line, Clean Caption, Devin Style) with full typography and palette authority.',
    inspectorData: {
      activeLayout: 'Balanced (Kinetic Stack)',
      fontPairing: 'Syne ExtraBold + Playfair Italic',
      casing: 'ALL CAPS / Mixed Case',
      wordPacing: '3 Words / Caption Block'
    }
  },
  {
    id: 'animate-sound-edit',
    stepNumber: '04',
    title: 'Animate, Edit & Sound Sync',
    tag: 'Motion, Text & SFX',
    desc: 'Select from 10 entrance animations targeting Words or Lines. Correct words or assign Support, Hero, and Accent role tags in-plugin, and automatically sync 5 built-in SFX cues to keyframes.',
    inspectorData: {
      motionPresets: '10 Entrance Animations (Word/Line Target)',
      inPluginEditor: 'Correct Words + Assign Hero/Accent Roles',
      soundSync: '5 Built-In SFX (Auto-Synced to Keyframes)',
      audioAdjustment: 'Automatic Event Hit or Manual Offset'
    }
  },
  {
    id: 'generate',
    stepNumber: '05',
    title: 'Generate Native Layers',
    tag: '100% Native AE Text',
    desc: 'Click Generate. Zero Velocity builds authentic, keyframed After Effects text layers and shape elements directly onto your timeline. Never flat, burned-in video.',
    inspectorData: {
      layerType: 'Native Adobe After Effects Text Layers',
      keyframes: 'Marker-Driven Transform Curves',
      vectorQuality: 'Infinite Resolution (Zero Pixelation)',
      reEditability: 'Fully Editable in Standard AE Timeline'
    }
  }
];

export default function WorkflowStudio() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = WORKFLOW_STEPS[activeStepIndex];

  return (
    <section id="workflow" className="workflow-studio">
      <div className="container">
        {/* Section Header */}
        <div className="workflow-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>Production Sequence</span>
          </div>
          <h2 className="section-title">
            From Raw Audio to Timeline Captions<br />
            <span className="text-gradient-accent">in 5 Cohesive Stages.</span>
          </h2>
          <p className="section-subtitle">
            One fluid pipeline inside Adobe After Effects. No round-tripping through web editors, no export-import friction.
          </p>
        </div>

        {/* Studio Workstation Interface */}
        <div className="studio-workstation panel-matte-elevated">
          {/* Workstation Top Chrome */}
          <div className="workstation-header">
            <div className="ws-traffic-lights">
              <span className="ws-dot ws-dot-red"></span>
              <span className="ws-dot ws-dot-yellow"></span>
              <span className="ws-dot ws-dot-green"></span>
            </div>
            <div className="ws-title-bar">
              <span className="ae-tag-badge">Ae</span>
              <span>Zero Velocity CEP • Production Sequence Pipeline</span>
            </div>
            <div className="ws-timecode-indicator">
              <span className="ws-tc-prefix">STAGE:</span>
              <span className="ws-tc-val">{activeStep.stepNumber} / 05</span>
            </div>
          </div>

          <div className="studio-body-grid">
            {/* Left Rail: 5-Step Interactive Stepper */}
            <div className="studio-stepper-rail">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const isPassed = activeStepIndex > idx;

                return (
                  <button
                    key={step.id}
                    className={`step-stepper-item ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    onClick={() => setActiveStepIndex(idx)}
                  >
                    <div className="stepper-indicator">
                      <span className="step-num">{step.stepNumber}</span>
                    </div>
                    <div className="stepper-text">
                      <div className="step-header-line">
                        <h4 className="step-label">{step.title}</h4>
                        <span className="step-tag-pill">{step.tag}</span>
                      </div>
                      <p className="step-brief">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Stage: Active Inspector & Mockup Canvas */}
            <div className="studio-inspector-stage">
              <div className="inspector-panel">
                <div className="inspector-top">
                  <div className="inspector-pill">
                    <span className="live-dot"></span>
                    <span>LIVE PIPELINE INSPECTOR</span>
                  </div>
                  <span className="inspector-comp-name">
                    Stage {activeStep.stepNumber}: {activeStep.title}
                  </span>
                </div>

                {/* Stage Canvas Simulation */}
                <div className="inspector-canvas-box">
                  {activeStep.id === 'import' && (
                    <div className="canvas-import-state">
                      <div className="audio-wave-graphic">
                        <div className="wave-bar h-1"></div>
                        <div className="wave-bar h-3"></div>
                        <div className="wave-bar h-5"></div>
                        <div className="wave-bar h-8"></div>
                        <div className="wave-bar h-4"></div>
                        <div className="wave-bar h-7"></div>
                        <div className="wave-bar h-9"></div>
                        <div className="wave-bar h-6"></div>
                        <div className="wave-bar h-2"></div>
                      </div>
                      <span className="canvas-caption-label">Audio Track Synchronized • 48kHz Stereo</span>
                    </div>
                  )}

                  {activeStep.id === 'transcribe' && (
                    <div className="canvas-transcribe-state">
                      <div className="srt-block-preview">
                        <span className="srt-time">00:00:03:12 → 00:00:05:08</span>
                        <p className="srt-text">"Ab captions banana hua superfast direct in After Effects"</p>
                      </div>
                      <span className="engine-status-badge">Local Whisper Engine • 100% Private</span>
                    </div>
                  )}

                  {activeStep.id === 'style' && (
                    <div className="canvas-layout-state">
                      <div className="layout-badge-rack">
                        <span className="layout-pill active">Balanced</span>
                        <span className="layout-pill">Corporate Clean</span>
                        <span className="layout-pill">Progressive Line</span>
                        <span className="layout-pill">Devin Style</span>
                      </div>
                      <div className="mini-layout-preview">
                        <div className="mini-balanced-preview">
                          <span className="mini-sub">Most People Never</span>
                          <span className="mini-hero">
                            <span className="font-serif italic text-amber-300">Doing</span> This
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep.id === 'animate-sound-edit' && (
                    <div className="canvas-combined-state">
                      {/* Integrated Motion, Edit, and Sound Overview */}
                      <div className="combined-features-grid">
                        <div className="combined-feat-card">
                          <span className="feat-title">10 Entrance Animations</span>
                          <span className="feat-desc">Bounce 1–4, Fade Up, Directional Slides &amp; Flicker targeting Words or Lines</span>
                        </div>
                        <div className="combined-feat-card">
                          <span className="feat-title">In-Plugin Text Editor</span>
                          <span className="feat-desc">Correct text before timeline creation and tag Support, Hero, or Accent roles</span>
                        </div>
                        <div className="combined-feat-card">
                          <span className="feat-title">5 Built-In Audio Cues</span>
                          <span className="feat-desc">Pops, Clicks, Whooshes, and Snaps with auto-sync or manual frame offset</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep.id === 'generate' && (
                    <div className="canvas-generate-state">
                      <div className="ae-layers-list">
                        <div className="layer-item-row">
                          <span className="layer-type-t">T</span>
                          <span className="layer-name">[ZV] Hero_Doing_This</span>
                        </div>
                        <div className="layer-item-row">
                          <span className="layer-type-t">T</span>
                          <span className="layer-name">[ZV] Base_Most_People_Never</span>
                        </div>
                      </div>
                      <span className="generate-complete-pill">✓ 100% Native AE Layers Generated</span>
                    </div>
                  )}
                </div>

                {/* Inspector Metadata Grid */}
                <div className="inspector-specs-grid">
                  {Object.entries(activeStep.inspectorData).map(([key, val]) => (
                    <div key={key} className="spec-row">
                      <span className="spec-label">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="spec-value">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
