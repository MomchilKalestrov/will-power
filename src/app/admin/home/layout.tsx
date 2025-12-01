import React from 'react';
//@ts-expect-error only because vscode requires this :/
import '../globals.css';

const Layout = ({ children }: { children: React.ReactNode }) => children;

export default Layout;