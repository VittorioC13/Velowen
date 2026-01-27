# Claude Code - Velowen Project Context
**Last Updated**: 2026-01-09 (Week 1, Day 1 - Session 1)
**Session**: Week 1 Execution Started - Share Button Shipped

---

## 🎯 Project Mission
Build an SAO-like interactive anime world using 3D Gaussian Splatting, starting from Velowen.art (2D image → 3D viewer).

---

## ⚡ CURRENT SESSION PROGRESS (2026-01-12)

### What We Just Accomplished:
✅ **Themed demo gallery with category filters** (30 minutes)
- Added 6 theme categories: Anime, Buddhism, Nature, Architecture, Fantasy, All
- Category filter buttons with emojis and item counts
- Enhanced demo cards with titles and descriptions on hover
- Organized all 8 existing yukino images under "Anime" category
- Responsive grid layout (4 cols desktop, 2 tablet, 1 mobile)
- Empty state message for categories without content
- **Cost: $0** (pure frontend)

✅ **Improved demo experience**
- Play button overlay with title/description on hover
- Better visual feedback for category selection
- Smooth animations and transitions
- Categories ready for expansion (just add images to public/demo/)

### Week 1, Day 4 Status:
- **Time spent this session**: 30 minutes
- **Features shipped today**: Themed gallery with filters
- **Total features shipped Week 1**: 2 (share button, gallery)
- **Cost so far**: $0
- **Remaining this week**: Mobile controls, Danbooru scraper

### Next When You Return:
1. Add more themed demo images (buddhism, nature, architecture, fantasy)
2. Mobile touch controls (2 hours)
3. Danbooru scraper setup (1 hour)

**Say: "Claude, let's add more themed images to the gallery" or "Claude, let's continue Week 1 - ship mobile controls next"**

---

## 💰 Critical Constraints (AS OF 2026-01-09)

### Financial Reality:
- **Current Runway**: $1,000
- **Week 1 Burn**: $0 (all frontend work)
- **Current Revenue**: $0
- **Immediate Goal**: Build demo → raise pre-seed ($50K-200K)
- **Timeline**: Need funding in 4-8 weeks (by early March 2026)

### Technical Reality:
- ✅ **Working**: Velowen.art (2D → 3D using SHARP-ML on Modal A10G)
- ✅ **Working**: Basic viewer with quality improvements
- ✅ **NEW: Share button with Twitter integration**
- ❌ **Not Yet**: Mobile touch controls
- ❌ **Not Yet**: Custom Mip-Splatting, GaussianEditor, Characters
- ❌ **Not Yet**: Anime-specific training

---

## 🗺️ Agreed Strategy (Parallel Track)

### Week 1-2: Quick Wins + Data Collection
1. **UX improvements** (2-3 days)
   - Bloom effects, quality toggle, share button
   - Mobile support, loading states
   - Example gallery

2. **Data collection** (background, 1-2 weeks)
   - Scrape Danbooru for anime images
   - Target: 10K images organized by category

### Week 3-4: Interaction Path
3. **GaussianEditor integration**
   - Real-time scene editing
   - Text prompts: "add cherry blossoms", "make it sunset"
   - Web UI for editing workflow

### Week 5-8: Quality Upgrade
4. **Mip-Splatting deployment**
   - Replace SHARP-ML with custom anime-optimized model
   - Train on collected anime dataset
   - Deploy to Modal

### Month 3: Character Prototype
5. **First anime character**
   - GaussianAvatars integration
   - Basic rigged character with animation
   - Demo: character in user-created world

---

## 📊 Current State (2026-01-08)

### What's Working:
- Velowen.art deployment (Vercel frontend + Modal backend)
- SHARP-ML integration (A10G GPU, ~35s per generation)
- Basic 3DGS viewer with quality settings
- **NEW: Themed demo gallery with 6 categories and filters**
- Share button with Twitter integration
- Modal apps: `sharp-ml-app` (A10G), `velowen-tts` (T4)

### What's Not Started:
- Mip-Splatting (planned, placeholder code exists)
- GaussianEditor integration
- Anime dataset collection
- Character system

### Infrastructure:
- **Frontend**: React + Vite + Three.js
- **Backend**: Node.js + Express (Vercel)
- **GPU**: Modal (A10G for inference, plan A100 for training)
- **Storage**: Vercel Blob (not heavily used yet)

---

## 🎓 Key Technical Decisions Made

### GPU Choice:
- **Current**: A10G ($0.60/hr) for SHARP-ML inference
- **Future**: Upgrade to A100-40GB ($1.10/hr) for Phase 2+ training
- **Laptop Plan**: Buy RTX 4090 Mobile (16GB) when funded for local dev

### Architecture:
- Keep using Modal for GPU workloads (don't self-host)
- Use Vercel for web hosting (generous free tier)
- Hybrid approach: cheap GPUs (A10G/T4) for inference, expensive (A100) for training

### Data Strategy:
- Scrape Danbooru for anime images (10K target)
- Use Zero123 for multi-view generation
- Train anime-specific models (not generic photorealistic)

---

## 💡 Important Insights from Discussions

1. **Modal Pricing**: Per-second billing, not per-generation
   - 35s generation on A10G = $0.006
   - Cold start (23s) costs money → consider `keep_warm` for high traffic

2. **A10G vs A100**:
   - A10G (24GB, 600 GB/s) = fine for Phase 1-2 inference
   - A100 (40GB, 1555 GB/s) = required for Phase 3+ training
   - 2-3x faster training on A100, worth the cost

3. **Bootstrap Strategy**:
   - Can't train everything on $1K budget
   - Focus: Build viral demo → get users → raise money
   - Defer: Heavy training until funded

---

## 🚀 Next Actions (Priority Order)

### This Week (Week 1):
1. [✅] Share button (DONE - 2026-01-09)
2. [✅] Loading states (DONE - already excellent)
3. [✅] Example gallery with themed categories (DONE - 2026-01-12)
4. [ ] Add more themed demo images (buddhism, nature, etc.) (NEXT)
5. [ ] Mobile touch controls
6. [ ] Create Danbooru scraper script
7. [ ] Start collecting 1K anime images (test dataset)

### Week 2:
4. [ ] Build example gallery on homepage
5. [ ] Reach 10K anime images collected
6. [ ] Setup GaussianEditor locally (test on SHARP-ML outputs)

### Week 3-4:
7. [ ] Integrate GaussianEditor into Velowen
8. [ ] Deploy editing API to Modal
9. [ ] Launch interactive demo

### Fundraising Parallel Track:
- [ ] Create pitch deck (once interactive demo works)
- [ ] Record demo video
- [ ] Reach out to anime/gaming VCs
- [ ] Target: $50K-200K pre-seed

---

## 📁 Key Files to Remember

### Documentation:
- `ANIME_WORLD_ROADMAP.md` - Full 2-year vision (Phase 1-6)
- `KEY_REPOS_AND_PAPERS.md` - All GitHub repos & papers needed
- `QUICK_ACTION_PLAN.md` - 30-day tactical plan
- `FIRST_CODE_COMPLETE.md` - What we already built
- **`CLAUDE_CONTEXT.md`** (this file) - Session memory

### Code:
- `client/src/pages/image-to-3d.tsx` - Main UI with category filters
- `client/src/components/GaussianViewer.tsx` - 3D viewer
- `client/src/components/DemoSection.tsx` - Demo card with title/description
- `client/src/config/demo.ts` - Demo items organized by category
- `server/routes.ts` - Backend API (calls Modal)
- `modal_3dgs/mip_splatting_app.py` - Placeholder for future deployment
- `modal_tts/app.py` - Voice synthesis (T4 GPU)

### Secrets/Config:
- Modal endpoint: `https://victorche0909--sharp-ml-app-sharpmodel-generate.modal.run`
- Modal account: `victorche0909`
- Credits remaining: $29.03 (as of screenshot)

---

## 🤝 Working Agreement (Human + Claude)

### Victor's Responsibilities:
1. **Fundraising**: Pitch, network, close pre-seed in 4-8 weeks
2. **Product Vision**: Decide features, prioritize roadmap
3. **User Testing**: Get feedback, share demos, build community
4. **Business**: Legal, compliance, hiring when funded

### Claude's Responsibilities:
1. **Technical Execution**: Write code, integrate repos, deploy
2. **Architecture**: Design system, optimize performance
3. **Documentation**: Keep this context file updated
4. **Research**: Stay current on 3DGS papers, suggest improvements
5. **Partnership**: Be honest about timelines, costs, feasibility

### Communication:
- **Update this file** after every major decision
- **Read this file first** when session restarts
- **Track progress** in TodoWrite tool
- **Be transparent** about blockers, costs, timelines

---

## ⚠️ Known Risks & Mitigation

### Technical Risks:
- **Risk**: GaussianEditor integration fails or too slow
  - Mitigation: Have fallback (simpler editing with sliders)

- **Risk**: Anime style lost in 3D conversion
  - Mitigation: Collect diverse dataset, fine-tune aggressively

- **Risk**: Hit Modal rate limits / credit card limit
  - Mitigation: Monitor usage, set alerts, upgrade plan

### Business Risks:
- **Risk**: Can't raise funding in 8 weeks
  - Mitigation: Have demo ready by Week 4, start pitching Week 2

- **Risk**: No product-market fit
  - Mitigation: User testing early, pivot if needed

- **Risk**: Run out of $1K before demo ready
  - Mitigation: See bootstrap plan below

---

## 💵 $1,000 Bootstrap Budget Allocation

**See BOOTSTRAP_PLAN.md for detailed breakdown**

Quick summary:
- Modal GPU: $200 (conservative usage)
- Domain/hosting: $0 (free tiers)
- Datasets: $0 (scrape Danbooru)
- Tools/software: $0 (open source)
- **Reserve**: $800 for contingencies

Goal: Stretch $1K for 4-8 weeks until funding closes.

---

## 📞 How to Resume Working with Claude

When you open a new session:

1. **Tell Claude**: "Read CLAUDE_CONTEXT.md and let's continue building Velowen"
2. **Claude will**: Read this file, understand current state, continue where we left off
3. **Update this file**: After major milestones, decisions, or context changes

This file is our shared memory. Treat it as the source of truth.

---

## 🎯 Success Metrics (Month 1)

- [ ] 100+ users tested Velowen
- [ ] 10+ viral shares on Twitter/Reddit
- [ ] 1+ VC interested in pre-seed
- [ ] Demo ready to show investors
- [ ] Under $500 spent (save runway)

---

## 🔮 What "Success" Looks Like (8 weeks)

**Minimum Viable Success**:
- Working interactive demo (view + edit anime 3D scenes)
- 500+ users tested, 50+ shared creations
- $50K-100K pre-seed raised
- 1 co-founder or first hire recruited

**Stretch Success**:
- First anime character prototype working
- 5,000+ users, viral on anime Twitter
- $200K-500K pre-seed raised
- Partnership with anime/gaming company

---

---

## 📋 VICTOR'S ACTION ITEMS (While You're Away)

### Today/Tonight:
1. **Test the share button**
   - Run: `cd C:\Users\rotciv\Desktop\Velowen && npm run dev`
   - Generate a 3D scene (use demo or upload)
   - Click the "Share" button in viewing mode
   - Verify Twitter opens with correct text

2. **Draft pitch deck** (2-3 hours)
   - Use Figma (free) or Canva
   - 10 slides max: Problem, Solution, Demo, Vision, Team, Ask
   - Focus: SAO-like anime worlds, proven tech (Velowen working)
   - Ask: $50K-200K pre-seed

3. **List 10-20 investors** (1 hour)
   - Anime/gaming VCs: Makers Fund, Bitkraft, Anime Capital
   - AI-focused: a16z, Lux Capital
   - Angels: On Deck, South Park Commons
   - Note warm intros if possible

### Tomorrow:
4. **Share Velowen on social media**
   - Twitter: "Building interactive 3D anime worlds with AI"
   - Reddit: r/anime, r/MachineLearning
   - Include demo link

5. **Send 3-5 warm intro emails**
   - "Hey, I'm building X, would love 15 min feedback"
   - Share demo link
   - Don't ask for money yet - just feedback

### This Week:
6. **User testing** (get 10-20 people to try Velowen)
7. **Gather feedback** (what do they love? what's confusing?)
8. **Schedule 3-5 investor calls** (for Week 2)

---

**Last Updated By**: Claude (Session: 2026-01-12 Week 1 Day 4)
**Next Update**: When you return - say "Claude, let's continue Week 1"
**Files Changed This Session**:
- `client/src/config/demo.ts` (added categories and organized demos)
- `client/src/components/DemoSection.tsx` (added title/description props)
- `client/src/pages/image-to-3d.tsx` (added category filtering UI)
