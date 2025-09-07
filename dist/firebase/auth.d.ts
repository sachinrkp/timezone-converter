export interface FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    providerId: string;
}
declare class FirebaseAuthService {
    private currentUser;
    constructor();
    private mapFirebaseUser;
    private onUserStateChange;
    signUpWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseUser>;
    signInWithEmail(email: string, password: string): Promise<FirebaseUser>;
    signInWithGoogle(): Promise<FirebaseUser>;
    signInWithFacebook(): Promise<FirebaseUser>;
    signInWithGithub(): Promise<FirebaseUser>;
    signOut(): Promise<void>;
    getCurrentUser(): FirebaseUser | null;
    isAuthenticated(): boolean;
    private getErrorMessage;
    getIdToken(): Promise<string | null>;
    refreshIdToken(): Promise<string | null>;
}
export declare const firebaseAuth: FirebaseAuthService;
export default firebaseAuth;
//# sourceMappingURL=auth.d.ts.map