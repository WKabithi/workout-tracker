// YouTube Breathwork Videos - 30 Day Program
const BREATHWORK_VIDEOS = {
    1: "lzid3my-ZBM",
    2: "2jRcLxPbNW4",
    3: "CoAOwT5Ewss",
    4: "dORVLShzlIk",
    5: "XMwNaticOAI",
    6: "4rmZR5om0o4",
    7: "5Buvu8ppyXg",
    8: "3wF5HIkjKps",
    9: "p4lOKSSUx6o",
    10: "Jgz8JZkMYh8",
    11: "fg-IuAYGWbQ",
    12: "HiE13ppUyZI",
    13: "g2XCLPiMQwU",
    14: "vwBDGsXIU-U",
    15: "xlyzZpwnj_w",
    16: "zZTeBfSTBRY",
    17: "TKlxVp2gjbM",
    18: "yjiK1kpMRmg",
    19: "isO2ie6AVGY",
    20: "ZT4HTNyOIMo",
    21: "PHynnwq-iDo",
    22: "p7jVTgofgvQ",
    23: "3mgctg0yadw",
    24: "DYezzTG5eoQ",
    25: "FOhxW4K43EM",
    26: "SQFdWTxkqjY",
    27: "ILQTgGyQ6mg",
    28: "0nQm-M_mkuQ",
    29: "dPBX2CttmsU",
    30: "KkBkdGvm76g"
};

// Get video ID for a specific day
function getVideoForDay(dayNumber) {
    // Cycle through if beyond 30 days
    const day = ((dayNumber - 1) % 30) + 1;
    return BREATHWORK_VIDEOS[day];
}

// Get current day number since user started
function getCurrentDayNumber(userStartDate) {
    const start = new Date(userStartDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get YouTube embed URL
function getVideoEmbedUrl(dayNumber) {
    const videoId = getVideoForDay(dayNumber);
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
}

// Track if user completed breathwork TODAY (not yesterday)
async function shouldShowSkipPrompt(userId) {
    if (!window.SheetsAPI) return false;
    
    try {
        const logs = await window.SheetsAPI.getDailyLogs();
        const today = new Date().toISOString().split('T')[0];
        
        // Check if there's a breathwork log for TODAY
        const todayLogs = logs.slice(1).filter(row => 
            row[2] === userId && 
            row[1] === today
        );
        
        // Find breathwork workout ID
        const workouts = await window.SheetsAPI.getWorkoutsByUserId(userId);
        const breathworkWorkout = workouts.find(w => 
            w[2].toLowerCase().includes('breath') || w[2].toLowerCase().includes('video')
        );
        
        if (!breathworkWorkout) return false;
        
        const breathworkId = breathworkWorkout[0];
        const hasBreathworkToday = todayLogs.some(log => log[3] === breathworkId);
        
        // Only show prompt if breathwork NOT completed today AND user has logged in before
        const userRow = await window.SheetsAPI.getUserByEmail(userId);
        const accountCreated = userRow[9]; // created_at
        const accountAge = Math.floor((new Date() - new Date(accountCreated)) / (1000 * 60 * 60 * 24));
        
        // Show prompt only if: account is older than 1 day AND no breathwork today
        return accountAge > 0 && !hasBreathworkToday;
    } catch (error) {
        console.error('Error checking skip:', error);
        return false;
    }
}

// Reset day counter to 1
async function resetBreathworkDay(userId) {
    try {
        await window.SheetsAPI.updateUser(userId, {
            breathworkStartDate: new Date().toISOString().split('T')[0]
        });
        return true;
    } catch (error) {
        console.error('Error resetting day:', error);
        return false;
    }
}

// Show skip day prompt
function showSkipDayPrompt(onReset, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
        <div class="loading-content" style="max-width: 500px;">
            <h2 style="margin-bottom: 20px; color: var(--text-primary);">⚠️ Missed Yesterday's Breathwork</h2>
            <p style="margin-bottom: 30px; color: var(--text-secondary); line-height: 1.6;">
                You didn't complete yesterday's breathwork video. Would you like to:
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button onclick="handleResetDay()" class="btn btn-primary">
                    🔄 Start Over from Day 1
                </button>
                <button onclick="handleContinueDay()" class="btn btn-secondary">
                    ▶️ Continue to Next Day
                </button>
            </div>
            <p style="margin-top: 20px; color: var(--text-secondary); font-size: 0.85rem;">
                Tip: Starting over helps maintain the program's progression
            </p>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    window.handleResetDay = () => {
        document.body.removeChild(overlay);
        onReset();
    };
    
    window.handleContinueDay = () => {
        document.body.removeChild(overlay);
        onContinue();
    };
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        BREATHWORK_VIDEOS, 
        getVideoForDay, 
        getCurrentDayNumber, 
        getVideoEmbedUrl,
        shouldShowSkipPrompt,
        resetBreathworkDay,
        showSkipDayPrompt
    };
}
