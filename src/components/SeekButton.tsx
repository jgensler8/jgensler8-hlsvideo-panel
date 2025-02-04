import React from 'react';
import { HlsContext } from './HLSPanel';

export const SeekButton: React.FC<{
    seekDelta: number,
    children?: React.ReactNode,
}> = ({ seekDelta, children }) => {
    const { hls } = React.useContext(HlsContext);
    function onClick() {
        if (hls && hls.media) {
            hls.media.currentTime += seekDelta;
        }
    }
    return <button onClick={onClick}>{children}</button>
}
