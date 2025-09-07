// Global type declarations

declare global {
  const firebase: {
    initializeApp: any;
    auth: {
      (app?: any): any;
      GoogleAuthProvider: any;
    };
  };
}

export {};
