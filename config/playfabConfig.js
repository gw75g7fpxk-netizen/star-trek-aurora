// PlayFab Integration - User authentication and cross-device cloud saves
// Microsoft Azure PlayFab - Title ID: 1A2EEC
//
// NOTE: Before deployment, configure OAuth credentials:
//   Google: https://console.cloud.google.com/ → APIs & Services → Credentials → OAuth 2.0 Client ID (Web application)
//   Apple:  https://developer.apple.com/ → Certificates, IDs & Profiles → Services IDs (Sign In with Apple)

const PlayFabManager = {
    TITLE_ID: '1A2EEC',

    // Replace with your Google OAuth 2.0 Client ID (Web application type)
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

    // Replace with your Apple Services ID configured for Sign In with Apple
    APPLE_SERVICE_ID: 'YOUR_APPLE_SERVICE_ID',

    isLoggedIn: false,
    playFabId: null,
    sessionTicket: null,
    displayName: null,

    // Initialize PlayFab SDK and restore any existing session
    initialize() {
        if (typeof PlayFab !== 'undefined') {
            PlayFab.settings.titleId = this.TITLE_ID
        }
        this._restoreSession()
        this._initApple()
    },

    _restoreSession() {
        try {
            const raw = localStorage.getItem('playfabSession')
            if (!raw) return
            const data = JSON.parse(raw)
            if (data.playFabId && data.sessionTicket) {
                this.playFabId = data.playFabId
                this.sessionTicket = data.sessionTicket
                this.displayName = data.displayName || null
                this.isLoggedIn = true
                if (typeof PlayFab !== 'undefined') {
                    PlayFab.settings.sessionTicket = this.sessionTicket
                }
                console.log('PlayFab: Session restored for', this.playFabId)
            }
        } catch (e) {
            // Clear any corrupted session data to prevent stale state
            try { localStorage.removeItem('playfabSession') } catch (_) {}
            console.warn('PlayFab: Failed to restore session — cleared', e)
        }
    },

    _persistSession() {
        try {
            localStorage.setItem('playfabSession', JSON.stringify({
                playFabId: this.playFabId,
                sessionTicket: this.sessionTicket,
                displayName: this.displayName
            }))
        } catch (e) {
            console.warn('PlayFab: Failed to persist session', e)
        }
    },

    _applySession(playFabId, sessionTicket, displayName) {
        this.playFabId = playFabId
        this.sessionTicket = sessionTicket
        this.displayName = displayName || null
        this.isLoggedIn = true
        if (typeof PlayFab !== 'undefined') {
            PlayFab.settings.sessionTicket = sessionTicket
        }
        this._persistSession()
    },

    _initApple() {
        if (typeof AppleID === 'undefined') return
        try {
            const redirectURI = window.location.href.split('#')[0].split('?')[0]
            AppleID.auth.init({
                clientId: this.APPLE_SERVICE_ID,
                scope: 'name email',
                redirectURI,
                usePopup: true
            })
        } catch (e) {
            console.warn('PlayFab: Apple Sign-In init failed', e)
        }
    },

    // Log out the current user
    logout() {
        this.playFabId = null
        this.sessionTicket = null
        this.displayName = null
        this.isLoggedIn = false
        try {
            localStorage.removeItem('playfabSession')
        } catch (e) {}
        console.log('PlayFab: Logged out')
    },

    // Initiate Google Sign-In flow and authenticate with PlayFab
    loginWithGoogle(callback) {
        if (typeof google === 'undefined' || !google.accounts) {
            callback(new Error('Google Sign-In is not available. Check your connection.'), null)
            return
        }
        try {
            const client = google.accounts.oauth2.initTokenClient({
                client_id: this.GOOGLE_CLIENT_ID,
                scope: 'openid profile email',
                callback: (response) => {
                    if (response.error) {
                        callback(new Error(response.error_description || response.error), null)
                        return
                    }
                    this._playfabLoginGoogle(response.access_token, callback)
                }
            })
            client.requestAccessToken()
        } catch (e) {
            callback(new Error('Google Sign-In failed: ' + e.message), null)
        }
    },

    _playfabLoginGoogle(accessToken, callback) {
        if (typeof PlayFabClientSDK === 'undefined') {
            callback(new Error('PlayFab SDK not loaded'), null)
            return
        }
        PlayFabClientSDK.LoginWithGoogleAccount({
            AccessToken: accessToken,
            TitleId: this.TITLE_ID,
            CreateAccount: true,
            InfoRequestParameters: { GetUserAccountInfo: true }
        }, (result, error) => {
            if (error) {
                callback(new Error(error.errorMessage || 'PlayFab Google login failed'), null)
                return
            }
            const name = result.data.InfoResultPayload?.AccountInfo?.TitleInfo?.DisplayName || null
            this._applySession(result.data.PlayFabId, result.data.SessionTicket, name)
            callback(null, result.data)
        })
    },

    // Initiate Apple Sign-In flow and authenticate with PlayFab
    loginWithApple(callback) {
        if (typeof AppleID === 'undefined') {
            callback(new Error('Apple Sign-In is not available. Check your connection.'), null)
            return
        }
        AppleID.auth.signIn().then((data) => {
            this._playfabLoginApple(data.authorization.id_token, callback)
        }).catch((err) => {
            // Silently ignore user-cancelled sign-in
            if (err && err.error !== 'popup_closed_by_user') {
                callback(new Error(err.error || 'Apple Sign-In failed'), null)
            }
        })
    },

    _playfabLoginApple(identityToken, callback) {
        if (typeof PlayFabClientSDK === 'undefined') {
            callback(new Error('PlayFab SDK not loaded'), null)
            return
        }
        PlayFabClientSDK.LoginWithApple({
            IdentityToken: identityToken,
            TitleId: this.TITLE_ID,
            CreateAccount: true,
            InfoRequestParameters: { GetUserAccountInfo: true }
        }, (result, error) => {
            if (error) {
                callback(new Error(error.errorMessage || 'PlayFab Apple login failed'), null)
                return
            }
            const name = result.data.InfoResultPayload?.AccountInfo?.TitleInfo?.DisplayName || null
            this._applySession(result.data.PlayFabId, result.data.SessionTicket, name)
            callback(null, result.data)
        })
    },

    // Save progress data to PlayFab cloud (fire-and-forget)
    saveProgressToCloud(data) {
        if (!this.isLoggedIn || typeof PlayFabClientSDK === 'undefined') return
        PlayFabClientSDK.UpdateUserData({
            Data: { starTrekAuroraProgress: JSON.stringify(data) }
        }, (result, error) => {
            if (error) {
                console.warn('PlayFab: Cloud save failed —', error.errorMessage)
            } else {
                console.log('PlayFab: Progress saved to cloud')
            }
        })
    },

    // Load progress from PlayFab cloud
    loadProgressFromCloud(callback) {
        if (!this.isLoggedIn || typeof PlayFabClientSDK === 'undefined') {
            callback(new Error('Not logged in'), null)
            return
        }
        PlayFabClientSDK.GetUserData({
            Keys: ['starTrekAuroraProgress']
        }, (result, error) => {
            if (error) {
                callback(new Error(error.errorMessage || 'Cloud load failed'), null)
                return
            }
            const entry = result.data?.Data?.starTrekAuroraProgress
            if (entry?.Value) {
                try {
                    callback(null, JSON.parse(entry.Value))
                } catch (e) {
                    callback(new Error('Failed to parse cloud save data'), null)
                }
            } else {
                callback(null, null) // No cloud save exists yet for this account
            }
        })
    }
}
