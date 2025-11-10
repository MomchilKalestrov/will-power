'use client'
import React from "react";
import { useFileSelector } from "@/components/fileSelector";

export default () => {
    const { selectFile } = useFileSelector();
    React.useEffect(() => {
        (function a() {
            selectFile('single').then(a)
        })()
    },[])
    return (
    <div className="w-lg p-8">
    </div>
);}