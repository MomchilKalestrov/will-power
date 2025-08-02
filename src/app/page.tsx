'use client'
import { ConfigProvider } from "@/components/configProvider";
import FontInput from "@/components/inputs/fontInput";

export default () => {
    return (
        <ConfigProvider>
            <FontInput value='var(--fuck-ass)' onChange={ console.log } />
        </ConfigProvider>
    )
}