import React, { useContext, useRef, useState } from 'react';
import { Slider } from '@grafana/ui';
import { HlsContext } from './HLSPanel';
import { EventBus, DataHoverEvent, SliderMarks, TimeRange } from '@grafana/data';
import { debounceTime } from 'rxjs';
import Hls from 'hls.js';
import { MediaActionTypes, useMediaDispatch } from 'media-chrome/dist/react/media-store';

// our slider hovered -> publish to shared crosshair
function hlsDateByRatio(hls: Hls, ratio: number): Date | null {
    // console.debug(hls.playingDate, hls.media?.currentTime)
    if (!hls || !hls.media || !hls.playingDate) {
        console.error("video does not have a playing date!");
        return null;
    }
    const startDate = new Date(hls.playingDate.getTime() - hls.media.currentTime * 1000);
    const offset = new Date(startDate.getTime() + ratio * hls.media.duration * 1000);
    return offset;
}

// other graph hovered -> mark on our slider
function markValueFromPointTime(hls: Hls, hoverPointTime: number): number {
    if (!hls || !hls.media || !hls.playingDate) {
        console.error("video does not have a playing date!");
        return -1;
    }
    const duration = hls.media.duration;
    const currentTime = hls.media.currentTime;
    const hoverDate = new Date(hoverPointTime)
    const startDate = new Date(hls.playingDate.getTime() - currentTime * 1000);
    const endDate = new Date(startDate.getTime() + duration * 1000)
    if (hoverDate <= startDate) {
        return 0
    } else if (hoverDate >= endDate) {
        return duration;
    }
    const totalTime = endDate.getTime() - startDate.getTime();
    const hoverDiff = hoverDate.getTime() - startDate.getTime();
    const markTick = Math.floor(hoverDiff / totalTime * duration);
    // console.debug(duration, hoverDiff, totalTime, hoverDiff / totalTime, markTick)
    return markTick;
}

interface Props {
    eventBus: EventBus,
    timeRange: TimeRange,
}

export const CrosshairTimeRange: React.FC<Props> = ({ eventBus, timeRange }) => {
    const sliderRef = useRef<HTMLSpanElement | null>(null);
    const [hoverTime, setHoverTime] = useState<number>(0)
    const { hls } = useContext(HlsContext);
    const dispatch = useMediaDispatch();

    let marks: SliderMarks = {};
    if(hls) {
        const hoverMark = markValueFromPointTime(hls, hoverTime);
        marks[hoverMark] = <>hover</>;
        const dashFromMark = markValueFromPointTime(hls, timeRange.from.toDate().getTime());
        marks[dashFromMark] = <>from</>
        const dashToMark = markValueFromPointTime(hls, timeRange.to.toDate().getTime());
        marks[dashToMark] = <>to</>
        // console.debug(timeRange.from.toDate(), timeRange.to.toDate())
        // console.debug("dashboard to: " + dashToMark)
    }

    React.useEffect(() => {
        eventBus
            .getStream(DataHoverEvent)
            .pipe(debounceTime(10))
            .subscribe({
                next: (evt) => {
                    if (eventBus === evt.origin) {
                        // console.debug("supressing")
                        return;
                    }
                    if (!evt.payload.point.time) {
                        return;
                    }
                    setHoverTime(evt.payload.point.time)
                },
            });
    }, [eventBus]);

    const [seekPosition, setSeekPosition] = React.useState(0);

    const handleSeekChange = (position: number) => {
        setSeekPosition(position);
        dispatch({
            type: MediaActionTypes.MEDIA_SEEK_REQUEST,
            detail: position,
        });
        // Handle actions based on seek position (e.g., highlight events)
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        // const sliderRect = event.currentTarget.getBoundingClientRect();
        if (!sliderRef.current) {
            throw new Error("CrosshairTimeRange > handleMouseMove > no slider ref")
        }
        if (!hls) {
            throw new Error("CrosshairTimeRange > handleMouseMove > no hls")
        }
        const sliderRect = sliderRef.current?.querySelector('.rc-slider-rail')?.getBoundingClientRect();
        if (!sliderRect) {
            throw new Error("CrosshairTimeRange > handleMouseMove > no slider rect")
        }
        const sliderWidth = sliderRect.width;
        const mouseX = event.clientX - sliderRect.left;
        const relativePosition = mouseX / sliderWidth;
        const relativeDate = hlsDateByRatio(hls, relativePosition);
        if (!relativeDate) {
            console.error("unable to determine shared corsshair date")
            return;
        }
        const time = relativeDate?.getTime();
        // console.debug(relativeDate, time)

        eventBus
            .publish(new DataHoverEvent({
                point: {
                    time: time,
                }
            }));
    };

    let max = 0;
    if(hls?.media?.duration) {
        max = hls?.media?.duration;
    }
    return (<span
        ref={sliderRef}
        onMouseMove={handleMouseMove}>
        <Slider
            min={0}
            max={max} // Adjust max value based on your timeline duration
            value={seekPosition}
            onChange={handleSeekChange}
            marks={marks}
        />
    </span>);
};
