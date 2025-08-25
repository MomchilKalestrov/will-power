'use client'
import dynamic from "next/dynamic";

const AdvancedInput = dynamic(() => import('@/components/inputs/advancedTextarea'), { ssr: false })

export default () => (
    <div className="w-128 p-8">
        <AdvancedInput onChange={ console.log } value={ '<br /><strong>tagtag</strong>tagtag' } />
    </div>
);