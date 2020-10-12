import React, { useState, useEffect } from 'react';
import moment from 'moment';


const Clock = () => {
    const [currentTime, setCurrentTime] = useState(moment());
    // const format = "DD/MM/YYYY HH:mm:ss";
    // const format = "hh:mm a";
    const format = "hh:mm:ss a";
    // const format = "HH:mm:ss";

    useEffect(() => {
        let timeInterval = setInterval(function() {
            setCurrentTime(moment())
        }, 1000)
        return function() {
            clearInterval(timeInterval)
        }
    }, []);

    return (
        <span className="bizex-clock">{currentTime.format(format)}</span>
    )
}

export default Clock