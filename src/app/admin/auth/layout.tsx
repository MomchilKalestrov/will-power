import React from 'react';
//@ts-ignore
import '../globals.css';
export default ({ children }: { children: React.ReactNode }) => <React.Suspense>{ children }</React.Suspense>;