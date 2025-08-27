import React from 'react';
import '../globals.css';
export default ({ children }: { children: React.ReactNode }) => <React.Suspense>{ children }</React.Suspense>;