import React, { useState } from "react";
import "./index.scss";
import { useSelector, useDispatch } from "react-redux";
import {
  selectConfig,
  submitQuiz,
  selectQuestions,
} from "../../Store/quizSlice";
import { useInterval } from "../../Hooks/useInterval";
import { RootState } from "../../Store/store";

export default function CountDown() {
  const dispatch = useDispatch();
  const config = useSelector((state: RootState) => selectConfig(state));
  const questions = useSelector((state: RootState) => selectQuestions(state));
  const [remainTime, setRemainTime] = useState<number>(
    config ? config.limitedSeconds : 99
  );

  const handleTimeUp = () => {
    window.scrollTo(0, 0);
    dispatch(submitQuiz(questions));
  };

  if (remainTime === 0) {
    handleTimeUp();
  }

  useInterval(
    () => {
      setRemainTime(remainTime - 1);
    },
    remainTime > 0 ? 1000 : null
  );

  return (
    <div className="count-down-container">
      <span>{remainTime}</span>
    </div>
  );
}
