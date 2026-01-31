# 💪 FitSync - Workout Accountability Tracker

> Stay accountable. Stay fit. Together.

A couples workout accountability app built with Firebase, Google Sheets, and Telegram integration.

---

## 🎯 Features

### ✅ User Authentication
- Email/password signup with verification
- Secure login with Firebase Auth
- Password reset functionality

### ✅ Workout Management
- Custom workout builder
- Morning schedule calculator
- Real-time progress tracking
- Exercise completion logging

### ✅ Partner Accountability
- Link with workout partner
- Real-time partner progress view
- Automated 8pm alerts if incomplete
- Telegram notifications

### ✅ Progress Tracking
- Daily workout logs
- Streak counter
- Total workouts completed
- Success rate calculation

### ✅ Data Persistence
- Google Sheets as database
- Real-time sync
- No backend server needed
- Easy data access and backup

---

## 🏗️ Architecture

```
┌─────────────────┐
│   GitHub Pages  │  ← Static hosting
│   (Frontend)    │
└────────┬────────┘
         │
         ├──→ Firebase Auth (Authentication)
         │
         ├──→ Google Sheets (Database)
         │    └── Users, Workouts, DailyLogs, Milestones
         │
         └──→ Telegram Bot (Notifications)

┌─────────────────┐
│ GitHub Actions  │  ← Scheduled tasks
│  (8pm Checker)  │
└─────────────────┘
```

---

## 🚀 Quick Start

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete step-by-step instructions.

**TL;DR:**
1. Set up Google Sheets (4 tabs with headers)
2. Upload files to GitHub
3. Configure GitHub Secrets
4. Enable GitHub Pages
5. Access your app!

**Your Live App:**
https://wkabithi.github.io/workout-tracker

---

## 📱 Usage

### For New Users:
1. Visit the app URL
2. Click "Sign up"
3. Verify your email
4. Complete profile setup:
   - Set work schedule
   - Build workout routine
   - Add Telegram (optional)
   - Link partner (optional)
5. Start tracking!

### Daily Usage:
1. Login each morning
2. Complete your exercises
3. Check them off as you go
4. System saves automatically
5. Partner gets alert at 8pm if you're incomplete

---

## 🗄️ Database Structure

### Google Sheets Tables:

**Users:**
- user_id, name, email, telegram_username
- work_start_time, commute_minutes, grooming_minutes
- partner_id, alert_time, created_at, last_login

**Workouts:**
- workout_id, user_id, exercise_name
- details, estimated_minutes, order_position

**DailyLogs:**
- log_id, date, user_id, workout_id
- completed, completion_time, notes

**Milestones:**
- milestone_id, user_id, milestone_type
- target_value, current_value, status, achieved_date

---

## 🔧 Configuration

### Firebase Config (`config.js`):
```javascript
firebase: {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ...
}
```

### Google Sheets (`config.js`):
```javascript
sheets: {
  apiKey: "...",
  spreadsheetId: "...",
  clientId: "..."
}
```

### Telegram (`config.js`):
```javascript
telegram: {
  botToken: "...",
  botUsername: "@fitsync_workout_bot"
}
```

---

## 📊 Features Breakdown

### Authentication (index.html)
- Firebase email/password auth
- Email verification required
- Persistent sessions
- Password reset

### Profile Setup (setup.html)
- 3-step wizard
- Work schedule input
- Workout builder
- Partner linking
- Saves to Google Sheets

### Dashboard (dashboard.html)
- Today's workout checklist
- Real-time progress bar
- Stats (streak, total workouts)
- Morning schedule timeline
- Partner status card
- Auto-sync with Sheets

### Accountability System (.github/workflows/)
- GitHub Actions cron job
- Runs daily at 8pm Nairobi time
- Checks incomplete workouts
- Sends Telegram alerts
- Notifies partners

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Firebase Auth SDK
- Google Sheets API v4
- Responsive design

**Backend:**
- Google Sheets (Database)
- Firebase Authentication
- Telegram Bot API
- GitHub Actions (Automation)

**Hosting:**
- GitHub Pages (Free static hosting)

---

## 📅 Roadmap

### ✅ Phase 1 (Complete)
- Authentication
- Profile setup
- Workout tracking
- Google Sheets integration
- Basic dashboard

### ✅ Phase 2 (Complete)
- Partner linking
- Telegram alerts
- Automated checks
- Stats calculation

### 🚧 Phase 3 (Future)
- Advanced progress page
- Calendar visualization
- Milestone badges
- Partner comparison page

### 🔮 Phase 4 (Ideas)
- YouTube playlist integration
- Mobile app (PWA)
- Social features
- Workout templates

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

**Ideas for improvement:**
- Better Telegram chat_id handling
- Advanced analytics
- Export workout history
- Custom milestone creation
- Workout photos/videos

---

## 📝 License

Private project. All rights reserved.

---

## 🙏 Acknowledgments

Built with:
- Firebase Authentication
- Google Sheets API
- Telegram Bot API
- GitHub Pages & Actions
- Love for fitness and accountability! 💪

---

## 📞 Support

**Issues?** Check DEPLOYMENT.md troubleshooting section.

**Questions?** Review the setup guide step-by-step.

**Telegram Bot:** @fitsync_workout_bot

---

**Start Date:** January 28, 2026
**Status:** ✅ Production Ready
**Version:** 1.0.0

---

Made with ❤️ for couples who workout together, stay together! 🏋️‍♀️🏋️‍♂️
