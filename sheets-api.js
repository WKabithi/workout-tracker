// FitSync Google Sheets API with OAuth2 - Fixed Token Persistence
const SheetsAPI = {
    initialized: false,
    tokenClient: null,
    accessToken: null,

    async init() {
        if (this.initialized) {
            console.log('SheetsAPI already initialized');
            return;
        }

        return new Promise((resolve, reject) => {
            // Load Google API client
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.sheets.apiKey,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                    });

                    // Check for existing token in session storage
                    const storedToken = sessionStorage.getItem('gapi_access_token');
                    const tokenExpiry = sessionStorage.getItem('gapi_token_expiry');
                    
                    if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                        // Use stored token
                        this.accessToken = storedToken;
                        gapi.client.setToken({ access_token: storedToken });
                        this.initialized = true;
                        console.log('Using stored OAuth token');
                        resolve();
                        return;
                    }

                    // Create token client for OAuth2
                    this.tokenClient = google.accounts.oauth2.initTokenClient({
                        client_id: CONFIG.sheets.clientId,
                        scope: 'https://www.googleapis.com/auth/spreadsheets',
                        callback: (response) => {
                            if (response.error) {
                                reject(response);
                                return;
                            }
                            
                            // Store token with 1-hour expiry
                            this.accessToken = response.access_token;
                            const expiry = Date.now() + (3600 * 1000); // 1 hour
                            sessionStorage.setItem('gapi_access_token', response.access_token);
                            sessionStorage.setItem('gapi_token_expiry', expiry.toString());
                            
                            gapi.client.setToken(response);
                            this.initialized = true;
                            console.log('OAuth token obtained and stored');
                            resolve();
                        },
                    });

                    // Request token only if not stored
                    this.tokenClient.requestAccessToken({ prompt: '' }); // Empty prompt = no consent screen if already authorized
                    
                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    async ensureAuth() {
        if (!this.initialized) {
            await this.init();
        }
        
        // Check if token is still valid
        const tokenExpiry = sessionStorage.getItem('gapi_token_expiry');
        if (!tokenExpiry || Date.now() >= parseInt(tokenExpiry)) {
            // Token expired, refresh silently
            return new Promise((resolve, reject) => {
                this.tokenClient.callback = (response) => {
                    if (response.error) {
                        reject(response);
                        return;
                    }
                    const expiry = Date.now() + (3600 * 1000);
                    sessionStorage.setItem('gapi_access_token', response.access_token);
                    sessionStorage.setItem('gapi_token_expiry', expiry.toString());
                    gapi.client.setToken(response);
                    resolve();
                };
                this.tokenClient.requestAccessToken({ prompt: '' });
            });
        }
    },

    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },

    async getUsers() {
        await this.ensureAuth();
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'Users!A:L'
            });
            return response.result.values || [];
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    },

    async getUserByEmail(email) {
        const users = await this.getUsers();
        const userRow = users.find((row, index) => index > 0 && row[2] === email);
        return userRow || null;
    },

    async createUser(userData) {
        await this.ensureAuth();
        const userId = this.generateId('user');
        const row = [
            userId,
            userData.name,
            userData.email,
            userData.telegram || '',
            userData.workTime || '09:00',
            userData.commute || '0',
            userData.grooming || '0',
            '',
            userData.alertTime || '20:00',
            this.getCurrentDate(),
            this.getCurrentDate(),
            this.getCurrentDate()
        ];

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'Users!A:L',
                valueInputOption: 'RAW',
                resource: { values: [row] }
            });
            return userId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async updateUser(email, updates) {
        await this.ensureAuth();
        try {
            const users = await this.getUsers();
            const rowIndex = users.findIndex((row, idx) => idx > 0 && row[2] === email);
            
            if (rowIndex > 0) {
                const currentRow = users[rowIndex];
                const updatedRow = [
                    currentRow[0],
                    updates.name !== undefined ? updates.name : currentRow[1],
                    currentRow[2],
                    updates.telegram !== undefined ? updates.telegram : currentRow[3],
                    updates.workTime !== undefined ? updates.workTime : currentRow[4],
                    updates.commute !== undefined ? updates.commute : currentRow[5],
                    updates.grooming !== undefined ? updates.grooming : currentRow[6],
                    updates.partnerId !== undefined ? updates.partnerId : currentRow[7],
                    updates.alertTime !== undefined ? updates.alertTime : currentRow[8],
                    currentRow[9],
                    this.getCurrentDate(),
                    updates.breathworkStartDate !== undefined ? updates.breathworkStartDate : (currentRow[11] || this.getCurrentDate())
                ];

                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: CONFIG.sheets.spreadsheetId,
                    range: `Users!A${rowIndex + 1}:L${rowIndex + 1}`,
                    valueInputOption: 'RAW',
                    resource: { values: [updatedRow] }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    async updateUserLastLogin(email) {
        return this.updateUser(email, {});
    },

    async updateUserPartner(userEmail, partnerEmail) {
        await this.ensureAuth();
        const partnerRow = await this.getUserByEmail(partnerEmail);
        if (partnerRow) {
            return this.updateUser(userEmail, { partnerId: partnerRow[0] });
        }
        throw new Error('Partner not found');
    },

    async getWorkouts() {
        await this.ensureAuth();
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'Workouts!A:F'
            });
            return response.result.values || [];
        } catch (error) {
            console.error('Error getting workouts:', error);
            throw error;
        }
    },

    async getWorkoutsByUserId(userId) {
        const workouts = await this.getWorkouts();
        return workouts.filter((row, index) => index > 0 && row[1] === userId);
    },

    async createMultipleWorkouts(userId, workoutsData) {
        await this.ensureAuth();
        const rows = workoutsData.map((workout, index) => [
            this.generateId('workout'),
            userId,
            workout.name,
            workout.details,
            workout.minutes.toString(),
            index.toString()
        ]);

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'Workouts!A:F',
                valueInputOption: 'RAW',
                resource: { values: rows }
            });
            return true;
        } catch (error) {
            console.error('Error creating workouts:', error);
            throw error;
        }
    },

    async updateWorkout(workoutId, updates) {
        await this.ensureAuth();
        try {
            const workouts = await this.getWorkouts();
            const rowIndex = workouts.findIndex((row, idx) => idx > 0 && row[0] === workoutId);
            
            if (rowIndex > 0) {
                const currentRow = workouts[rowIndex];
                const updatedRow = [
                    currentRow[0],
                    currentRow[1],
                    updates.name !== undefined ? updates.name : currentRow[2],
                    updates.details !== undefined ? updates.details : currentRow[3],
                    updates.minutes !== undefined ? updates.minutes.toString() : currentRow[4],
                    updates.order !== undefined ? updates.order.toString() : currentRow[5]
                ];

                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: CONFIG.sheets.spreadsheetId,
                    range: `Workouts!A${rowIndex + 1}:F${rowIndex + 1}`,
                    valueInputOption: 'RAW',
                    resource: { values: [updatedRow] }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating workout:', error);
            throw error;
        }
    },

    async deleteWorkout(workoutId) {
        await this.ensureAuth();
        try {
            const workouts = await this.getWorkouts();
            const rowIndex = workouts.findIndex((row, idx) => idx > 0 && row[0] === workoutId);
            
            if (rowIndex > 0) {
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: CONFIG.sheets.spreadsheetId,
                    resource: {
                        requests: [{
                            deleteDimension: {
                                range: {
                                    sheetId: 0,
                                    dimension: 'ROWS',
                                    startIndex: rowIndex,
                                    endIndex: rowIndex + 1
                                }
                            }
                        }]
                    }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting workout:', error);
            throw error;
        }
    },

    async getDailyLogs() {
        await this.ensureAuth();
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'DailyLogs!A:G'
            });
            return response.result.values || [];
        } catch (error) {
            console.error('Error getting logs:', error);
            throw error;
        }
    },

    async getTodayLogs(userId) {
        const logs = await this.getDailyLogs();
        const today = this.getCurrentDate();
        return logs.filter((row, index) => index > 0 && row[2] === userId && row[1] === today);
    },

    async logWorkoutCompletion(userId, workoutId, notes = '') {
        await this.ensureAuth();
        const logId = this.generateId('log');
        const now = new Date();
        const row = [
            logId,
            this.getCurrentDate(),
            userId,
            workoutId,
            'true',
            now.toISOString(),
            notes
        ];

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'DailyLogs!A:G',
                valueInputOption: 'RAW',
                resource: { values: [row] }
            });
            return logId;
        } catch (error) {
            console.error('Error logging workout:', error);
            throw error;
        }
    },

    async removeWorkoutCompletion(userId, workoutId) {
        await this.ensureAuth();
        try {
            const logs = await this.getDailyLogs();
            const today = this.getCurrentDate();
            const logIndex = logs.findIndex((row, idx) => 
                idx > 0 && row[2] === userId && row[3] === workoutId && row[1] === today
            );

            if (logIndex > 0) {
                const sheetId = await this.getSheetId('DailyLogs');
                await gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: CONFIG.sheets.spreadsheetId,
                    resource: {
                        requests: [{
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: 'ROWS',
                                    startIndex: logIndex,
                                    endIndex: logIndex + 1
                                }
                            }
                        }]
                    }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing log:', error);
            throw error;
        }
    },

    async getSheetId(sheetName) {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: CONFIG.sheets.spreadsheetId
        });
        const sheet = response.result.sheets.find(s => s.properties.title === sheetName);
        return sheet ? sheet.properties.sheetId : 0;
    },

    async calculateStreak(userId) {
        const logs = await this.getDailyLogs();
        const userLogs = logs.filter((row, idx) => idx > 0 && row[2] === userId);
        
        if (userLogs.length === 0) return 0;

        const uniqueDates = [...new Set(userLogs.map(row => row[1]))].sort().reverse();
        let streak = 0;
        const today = this.getCurrentDate();
        let checkDate = new Date(today);

        for (const date of uniqueDates) {
            const logDate = new Date(date);
            const diffDays = Math.floor((checkDate - logDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0 || diffDays === 1) {
                streak++;
                checkDate = logDate;
            } else {
                break;
            }
        }

        return streak;
    },

    async getUserStats(userId) {
        const logs = await this.getDailyLogs();
        const userLogs = logs.filter((row, idx) => idx > 0 && row[2] === userId);
        const uniqueDays = [...new Set(userLogs.map(row => row[1]))];
        const currentStreak = await this.calculateStreak(userId);

        return {
            totalWorkouts: userLogs.length,
            uniqueDays: uniqueDays.length,
            currentStreak: currentStreak
        };
    },

    async getUserMilestones(userId) {
        await this.ensureAuth();
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'Milestones!A:G'
            });
            const milestones = response.result.values || [];
            return milestones.filter((row, idx) => idx > 0 && row[1] === userId);
        } catch (error) {
            console.error('Error getting milestones:', error);
            throw error;
        }
    },

    async initializeUserMilestones(userId) {
        await this.ensureAuth();
        const milestones = [
            [this.generateId('milestone'), userId, '7_day_streak', '7', '0', 'IN_PROGRESS', ''],
            [this.generateId('milestone'), userId, '30_day_streak', '30', '0', 'IN_PROGRESS', ''],
            [this.generateId('milestone'), userId, '100_workouts', '100', '0', 'IN_PROGRESS', ''],
            [this.generateId('milestone'), userId, '90_percent_success', '90', '0', 'IN_PROGRESS', ''],
            [this.generateId('milestone'), userId, '6_month_consistency', '180', '0', 'IN_PROGRESS', '']
        ];

        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: CONFIG.sheets.spreadsheetId,
                range: 'Milestones!A:G',
                valueInputOption: 'RAW',
                resource: { values: milestones }
            });
            return true;
        } catch (error) {
            console.error('Error initializing milestones:', error);
            throw error;
        }
    }
};
