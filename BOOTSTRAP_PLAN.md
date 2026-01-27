# $1,000 Bootstrap Plan - Velowen to Funding

**Reality Check**: You have $1,000 and need to raise $50K-200K in 4-8 weeks.
**Strategy**: Build the minimum viable demo that gets investors excited, then raise money for real development.

---

## 💰 Budget Breakdown ($1,000 Total)

### GPU Compute: $200 (20%)
**Modal usage - conservative estimates**

| Task | GPU | Time | Cost | Notes |
|------|-----|------|------|-------|
| Current testing (100 gens) | A10G | 1hr total | $0.60 | Already using |
| GaussianEditor testing | A10G | 5hrs | $3.00 | Integration work |
| Anime dataset prep | A10G | 10hrs | $6.00 | Multi-view generation |
| Demo refinement (500 gens) | A10G | 5hrs | $3.00 | User testing |
| **Contingency** | A10G | 30hrs | $18.00 | Unexpected needs |
| **Monthly reserve** | - | - | $169.40 | 2 months runway |

**Strategy to save costs:**
- ✅ Use free tiers aggressively (Modal has $30 free credits)
- ✅ Avoid `keep_warm` (save idle costs)
- ✅ Batch processing (reduce cold starts)
- ✅ Use T4 ($0.30/hr) for non-critical tasks
- ✅ No A100 training until funded

### Tools & Services: $0 (0%)
**Use free tiers exclusively**

| Service | Cost | Free Tier | Usage |
|---------|------|-----------|-------|
| Vercel | $0 | ✅ Unlimited | Frontend hosting |
| Vercel Blob | $0 | ✅ 10GB | PLY file storage |
| GitHub | $0 | ✅ Unlimited | Code repo |
| Modal | $0 | ✅ $30 credits | GPU inference |
| Danbooru | $0 | ✅ Public API | Anime images |
| Domain | $0 | ✅ .vercel.app | velowen.vercel.app |

**No paid tools needed for MVP.**

### Dataset: $0 (0%)
**Scrape open datasets**

- Danbooru: 6M+ anime images (public API)
- Safebooru: Family-friendly subset
- Zero123: Open source (run on Modal)
- rembg: Free background removal

**Strategy:**
- Scrape 10K images over 2 weeks
- Process incrementally (don't need all at once)
- Use free Google Colab for preprocessing if needed

### Marketing: $0 (0%)
**Organic only**

- Twitter (free)
- Reddit (r/anime, r/MachineLearning)
- Hacker News
- YouTube (demo video)
- ProductHunt (free launch)

**No paid ads until post-funding.**

### Legal/Admin: $0 (0%)
**Defer until funded**

- No LLC needed for demo
- No trademarks yet
- Use open source licenses
- Incorporate after funding closes

### Reserve: $800 (80%)
**Critical buffer**

- Emergency Modal credits
- Unexpected API costs
- Food/coffee while coding (you still need to eat)
- **Keep untouched unless absolutely necessary**

---

## 🎯 What You CAN Build with $1,000

### Week 1-2: UX Polish ($10-20)
**Goal**: Make current Velowen shareable

```
Costs:
- Modal testing: ~100 generations × $0.006 = $0.60
- Storage: Free (Vercel Blob)
- Deployment: Free (Vercel)

Deliverables:
✅ Share button (Twitter integration)
✅ Example gallery
✅ Mobile support
✅ Loading animations
✅ Better error messages

Total: ~$1-2 (mostly testing)
```

### Week 3-4: GaussianEditor Demo ($50-80)
**Goal**: Interactive editing prototype

```
Costs:
- GaussianEditor testing: 10 hours × $0.60 = $6
- Fine-tuning experiments: 20 hours × $0.60 = $12
- User testing (500 edits): 500 × 0.3min × $0.0001667 = $2.50
- Demo refinement: ~$30

Deliverables:
✅ Real-time scene editing
✅ Text prompts ("add cherry blossoms")
✅ Web UI integration
✅ Before/after comparisons

Total: ~$50-80
```

### Week 5-6: Dataset Collection ($20-30)
**Goal**: 10K anime images preprocessed

```
Costs:
- Danbooru scraping: Free (public API)
- Background removal: Run locally or Colab (free)
- Multi-view generation: 10K images × 2min × $0.0001667 = $33
- Storage: Free (local + Git LFS)

Deliverables:
✅ 10K curated anime images
✅ Multi-view datasets
✅ Training-ready pipeline

Total: ~$20-30 (mostly multi-view gen)
```

### Week 7-8: Investor Demo ($40-60)
**Goal**: Polished demo + pitch materials

```
Costs:
- Final testing: $20
- Demo video renders: $10
- User testing (100 users): $20
- Buffer: $10

Deliverables:
✅ 5-min demo video
✅ Live demo (deployed)
✅ Pitch deck (Figma - free)
✅ User testimonials
✅ Metrics (users, shares, engagement)

Total: ~$40-60
```

---

## 💸 Total 8-Week Burn: $200-300

**Remaining**: $700-800 in reserve

This gives you:
- 2-4 months of safety buffer
- Breathing room for fundraising
- Emergency funds for unexpected costs

---

## 🚫 What You CANNOT Build with $1,000

### Don't Even Try:
❌ **Custom Mip-Splatting training** (need $500+ in GPU for proper training)
❌ **GaussianAvatars from scratch** (need $1,000+ in compute)
❌ **4D Gaussian Splatting** (too early, too expensive)
❌ **Large-scale user acquisition** (need marketing budget)
❌ **Hiring anyone** (can't afford salaries yet)

### Defer Until Funded:
- Anime-specific model training (use SHARP-ML for demo)
- Character generation system
- Physics integration
- Multiplayer infrastructure
- VR/AR support

**The demo doesn't need to be perfect. It needs to be compelling.**

---

## 📈 Fundraising Strategy (Parallel to Building)

### Week 1-2: Prepare
While building UX improvements:
1. **Research investors**
   - Anime VCs: Anime Capital
   - Gaming VCs: Makers Fund, Bitkraft
   - AI VCs: a16z, Lux Capital
   - Angel groups: On Deck, South Park Commons

2. **Draft pitch deck** (use free Figma/Canva)
   - Problem: Anime fans want immersive worlds
   - Solution: AI-generated 3D anime worlds
   - Demo: Velowen.art (working product!)
   - Vision: SAO-like metaverse
   - Ask: $50K-200K pre-seed

3. **Build email list** (30-50 potential investors)

### Week 3-4: Soft Pitch
While building GaussianEditor:
1. **Share progress on Twitter**
   - "Building interactive anime 3D worlds with AI"
   - Share screenshots, demos
   - Tag relevant VCs

2. **Email warm intros**
   - "Hey, I'm building X, would love feedback"
   - Share demo link
   - Ask for 15-min call

3. **Test pitch with friends**
   - Practice explaining vision
   - Refine deck based on feedback

### Week 5-6: Active Pitching
While collecting dataset:
1. **Demo ready** - GaussianEditor working
2. **Schedule 20-30 calls**
3. **Track interest**
   - Who's excited?
   - What objections?
   - What do they want to see?

### Week 7-8: Close Round
1. **Pick lead investor** (best terms + value-add)
2. **Negotiate terms**
   - $50K-100K: SAFE note, $2M-5M cap
   - $100K-200K: SAFE note, $5M-10M cap
3. **Close** (2-4 weeks after handshake)

---

## 🎯 Pre-Seed Round Goals

### Minimum Target: $50,000
**Use for:**
- 6 months runway (live frugally)
- Modal GPU credits ($10K)
- Hire part-time engineer ($15K)
- Your salary ($25K for 6mo)

**Gets you to:**
- Mip-Splatting deployed
- 10K users
- Seed round metrics

### Target: $100,000
**Use for:**
- 9 months runway
- Modal GPU credits ($20K)
- Hire full-time engineer ($40K)
- Your salary ($40K for 9mo)

**Gets you to:**
- All of Phase 1-2 complete
- Characters prototype
- 50K users
- Seed round ready

### Stretch: $200,000
**Use for:**
- 12 months runway
- Full Phase 1-3 development
- 2 engineers hired
- Proper salaries
- Marketing budget

**Gets you to:**
- Character system working
- 100K+ users
- Seed round ($2M-5M)

---

## 📊 What Investors Want to See (Demo Requirements)

### Must-Have (for any funding):
1. ✅ **Working product** (Velowen.art deployed)
2. ✅ **Unique tech** (3DGS for anime is novel)
3. ✅ **Clear vision** (SAO-like world, you have roadmap)
4. ✅ **Some users** (even 50-100 is fine)
5. ✅ **Founder credibility** (you built v1 alone)

### Nice-to-Have (better terms):
6. ⭐ **User growth** (10% week-over-week)
7. ⭐ **Viral shares** (Twitter, Reddit mentions)
8. ⭐ **Interaction feature** (GaussianEditor demo)
9. ⭐ **Partnerships** (anime studio, VTuber interest)
10. ⭐ **Technical moat** (custom anime models)

**You can raise $50K with just the must-haves. Focus there.**

---

## ⚡ Speed vs Quality Trade-offs

### Optimize for SPEED (you have 8 weeks):

**DO:**
- ✅ Use existing SHARP-ML (don't train custom models yet)
- ✅ Fork & integrate (don't rewrite from scratch)
- ✅ Ugly UI is fine (as long as demo works)
- ✅ Manual processes OK (scraping, data prep)
- ✅ Hardcode settings (don't build config systems)

**DON'T:**
- ❌ Train custom Mip-Splatting (wait for funding)
- ❌ Build full CMS (hardcode example gallery)
- ❌ Perfect mobile experience (desktop-first)
- ❌ Support all browsers (Chrome only is fine)
- ❌ Write tests (tech debt is OK for demo)

**After funding, refactor everything properly.**

---

## 🚨 Failure Modes & Contingencies

### Scenario 1: Can't raise in 8 weeks
**Contingency:**
- Extend to 12 weeks (burn $100/mo more)
- Apply to Y Combinator / On Deck
- Launch on ProductHunt for users → revenue
- Consider co-founder with fundraising network

### Scenario 2: Run out of Modal credits
**Contingency:**
- Use free Google Colab (slower but free)
- Limit user testing (manual invite only)
- Ask Modal for startup credits ($500 available)
- Pause new features, focus on fundraising

### Scenario 3: GaussianEditor integration fails
**Contingency:**
- Pivot to simpler editing (sliders for color, time-of-day)
- Focus on quality (Mip-Splatting) instead
- Emphasize roadmap over current features

### Scenario 4: No investor interest
**Contingency:**
- Build community, monetize early ($5/mo subscription)
- 100 paid users × $5 = $500/mo → ramen profitable
- Bootstrap slower, raise later with traction

---

## 💡 Creative Ways to Extend Runway

### $0 Options:
1. **Free GPU credits**
   - Modal startup program
   - Google Cloud credits ($300)
   - AWS Activate ($1,000)
   - Replicate credits

2. **Revenue from users**
   - "Buy me a coffee" button
   - Premium exports ($1 per video)
   - Early access ($5/mo)

3. **Grants**
   - Stability AI grants
   - Open source funding
   - University GPU access

4. **Barter**
   - Trade Velowen credits for design work
   - Partner with anime creators (free promo)

### Last Resort:
- Part-time contract work (20hr/week, keep building)
- Don't give up equity too early (SAFE notes, not equity)

---

## ✅ Week-by-Week Checklist

### Week 1: UX + Fundraising Prep
- [ ] Ship share button
- [ ] Ship example gallery
- [ ] Mobile support working
- [ ] Draft pitch deck
- [ ] List 50 potential investors

**Spend: ~$5**

### Week 2: Data Collection + Outreach
- [ ] Scrape 5K anime images
- [ ] Start Danbooru pipeline
- [ ] Send 10 warm intro emails
- [ ] Post demo on Twitter

**Spend: ~$10**

### Week 3: GaussianEditor Integration
- [ ] GaussianEditor running locally
- [ ] First edit working (simple prompt)
- [ ] Web UI prototype
- [ ] 5 investor calls scheduled

**Spend: ~$30**

### Week 4: Interactive Demo
- [ ] GaussianEditor deployed
- [ ] 10+ edit examples
- [ ] Demo video recorded
- [ ] 10 investor meetings done

**Spend: ~$50**

### Week 5-6: Pitching
- [ ] 10K anime images collected
- [ ] 20+ investor pitches
- [ ] User testing (100 people)
- [ ] Refine demo based on feedback

**Spend: ~$40**

### Week 7-8: Closing
- [ ] Term sheet received
- [ ] Legal docs signed
- [ ] Funds in bank account
- [ ] Hire first engineer

**Spend: ~$60**

**Total: $195** (well under budget!)

---

## 🎯 Success Criteria (End of Week 8)

### Minimum Success:
- ✅ $50K raised
- ✅ Interactive demo working
- ✅ 100+ users tested
- ✅ 1,000+ Twitter impressions

### Stretch Success:
- ✅ $100K+ raised
- ✅ GaussianEditor fully integrated
- ✅ 500+ users, 50+ shares
- ✅ Partnership/pilot with anime studio

### Dream Success:
- ✅ $200K raised
- ✅ First character prototype
- ✅ 5,000+ users
- ✅ Viral on anime Twitter
- ✅ Y Combinator interview

---

## 🤝 Final Notes

**This is aggressive but doable.**

With $1,000 you can:
- Build a compelling demo
- Get 100+ users
- Raise $50K-200K

You **cannot**:
- Build the full SAO world
- Train everything from scratch
- Compete with funded companies

**Strategy**: Demo → Funding → Real Development

The next 8 weeks are about proving the vision is possible. Then you get the money to actually build it.

**Let's go. 🚀**

---

**Last Updated**: 2026-01-08
**Next Review**: End of Week 1 (update burn rate, adjust if needed)
