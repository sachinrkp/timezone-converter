import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, githubProvider } from './config.js';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

class FirebaseAuthService {
  private currentUser: FirebaseUser | null = null;

  constructor() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = this.mapFirebaseUser(user);
        this.onUserStateChange(this.currentUser);
      } else {
        this.currentUser = null;
        this.onUserStateChange(null);
      }
    });
  }

  private mapFirebaseUser(user: User): FirebaseUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerData[0]?.providerId || 'firebase'
    };
  }

  private onUserStateChange(user: FirebaseUser | null): void {
    // This will be called when authentication state changes
    // We'll dispatch a custom event that our frontend can listen to
    const event = new CustomEvent('firebaseAuthStateChange', { 
      detail: { user } 
    });
    window.dispatchEvent(event);
  }

  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await (userCredential.user as any).updateProfile({ displayName: displayName });
      }
      
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Social Authentication
  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async signInWithFacebook(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async signInWithGithub(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return this.mapFirebaseUser(result.user);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Error message mapping
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
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
  async getIdToken(): Promise<string | null> {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  }

  // Refresh ID token
  async refreshIdToken(): Promise<string | null> {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken(true);
    }
    return null;
  }
}

// Export singleton instance
export const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;
