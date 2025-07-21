import React from 'react';


const Paragraph: React.FC<React.PropsWithChildren> = ({ children, ...props }) =>
    <p { ...props }>{ children }</p>

export default Paragraph;