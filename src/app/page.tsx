'use client'
import dynamic from "next/dynamic";
import { getAllUsers } from "@/lib/db/actions";
import React from "react";

const AdvancedInput = dynamic(() => import('@/components/inputs/advancedTextarea'), { ssr: false })

export default () => {
    React.useEffect(() => {
        getAllUsers().then(console.log);
    },[])
    return (
    <div className="w-128 p-8">
        <AdvancedInput onChange={ console.log } value={ '<br /><strong>tagtag</strong>tagtag' } />
    </div>
);}