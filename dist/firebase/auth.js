import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, facebookProvider, githubProvider } from './config.js';
class FirebaseAuthService {
    currentUser = null;
    constructor() {
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = this.mapFirebaseUser(user);
                this.onUserStateChange(this.currentUser);
            }
            else {
                this.currentUser = null;
                this.onUserStateChange(null);
            }
        });
    }
    mapFirebaseUser(user) {
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            providerId: user.providerData[0]?.providerId || 'firebase'
        };
    }
    onUserStateChange(user) {
        // This will be called when authentication state changes
        // We'll dispatch a custom event that our frontend can listen to
        const event = new CustomEvent('firebaseAuthStateChange', {
            detail: { user }
        });
        window.dispatchEvent(event);
    }
    // Email/Password Authentication
    async signUpWithEmail(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Update display name if provided
            if (displayName && userCredential.user) {
                await userCredential.user.updateProfile({ displayName: displayName });
            }
            return this.mapFirebaseUser(userCredential.user);
        }
        catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }
    async signInWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return this.mapFirebaseUser(userCredential.user);
        }
        catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }
    // Social Authentication
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return this.mapFirebaseUser(result.user);
        }
        catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }
    async signInWithFacebook() {
        try {
            const result = await signInWithPopup(auth, facebookProvider);
            return this.mapFirebaseUser(result.user);
        }
        catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }
    async signInWithGithub() {
        try {
            const result = await signInWithPopup(auth, githubProvider);
            return this.mapFirebaseUser(result.user);
        }
        catch (error) {
            throw new Error(this.getErrorMessage(error.code));
        }
    }
    // Sign Out
    async signOut() {
        try {
            await signOut(auth);
        }
        catch (error) {
            throw new Error('Failed to sign out');
        }
    }
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }
    // Error message mapping
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No user found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-closed-by-user': 'Sign-in popup was closed.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled.',
            'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.'
        };
        return errorMessages[errorCode] || 'An error occurred during authentication.';
    }
    // Get ID token for backend authentication
    async getIdToken() {
        if (auth.currentUser) {
            return await auth.currentUser.getIdToken();
        }
        return null;
    }
    // Refresh ID token
    async refreshIdToken() {
        if (auth.currentUser) {
            return await auth.currentUser.getIdToken(true);
        }
        return null;
    }
}
// Export singleton instance
export const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;
//# sourceMappingURL=auth.js.map