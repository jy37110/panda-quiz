import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectConfig,
  selectQuestions,
  selectGrade,
  selectQuizIsPassed,
  restartQuiz,
} from "../../Store/quizSlice";
import "./index.scss";
import moment from "moment";
import CountDown from "../CountDown";
import { questionsAreMarked } from "../../lib/lib";
import { RootState } from "../../Store/store";
import { Button } from "antd";

export default function QuizHeader() {
  const config = useSelector((state: RootState) => selectConfig(state));
  const questions = useSelector((state: RootState) => selectQuestions(state));
  const actualGrade = useSelector((state: RootState) => selectGrade(state));
  const quizIspassed = useSelector((state: RootState) =>
    selectQuizIsPassed(state)
  );
  const dispatch = useDispatch();

  const handleRestartBtnClick = useCallback(() => {
    dispatch(restartQuiz());
  }, [dispatch]);

  return (
    <div className="quiz-header-container">
      <h1 className="title">Panda Quiz - {moment().format("MM/DD/YYYY")}</h1>
      <div className="bar-item-container">
        {!questionsAreMarked(questions) && <CountDown />}
        {quizIspassed === false && (
          <Button type="default" onClick={handleRestartBtnClick} size="large">
            Restart
          </Button>
        )}
      </div>
      <div className="bar-item-container">
        <span>Total: {config.quizAmount}</span>
        <span>Time Limit: {config.limitedSeconds}s</span>
      </div>
      <div className="bar-item-container">
        <span>Required Grade: {config.scoreToPass}</span>
        <span
          className={
            actualGrade === null
              ? "normal-field"
              : actualGrade >= config.scoreToPass
              ? "green-field"
              : "red-field"
          }
        >
          Actual Grade: {actualGrade === null ? "-" : actualGrade}
        </span>
      </div>
    </div>
  );
}
