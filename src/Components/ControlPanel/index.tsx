import React, { useCallback } from "react";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAnswer,
  clearAnswer,
  submitQuiz,
  selectQuestions,
} from "../../Store/quizSlice";
import { RootState } from "../../Store/store";

export default function ControlPanel() {
  const dispatch = useDispatch();
  const questions = useSelector((state: RootState) => selectQuestions(state));

  const handleNumberClick = useCallback(
    (value) => {
      dispatch(updateAnswer(value));
    },
    [dispatch]
  );

  const handleCClick = useCallback(() => {
    dispatch(clearAnswer());
  }, [dispatch]);

  const handleSubmitClick = useCallback(() => {
    window.scrollTo(0, 0);
    dispatch(submitQuiz(questions));
  }, [dispatch, questions]);

  return (
    <div className="control-panel-container">
      <div className="fixed-panel-wrapper">
        <div className="control-panel">
          <div className="flex-row">
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(1);
              }}
            >
              1
            </div>
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(2);
              }}
            >
              2
            </div>
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(3);
              }}
            >
              3
            </div>
          </div>
          <div className="flex-row">
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(4);
              }}
            >
              4
            </div>
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(5);
              }}
            >
              5
            </div>
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(6);
              }}
            >
              6
            </div>
          </div>
          <div className="flex-row">
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(7);
              }}
            >
              7
            </div>
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(8);
              }}
            >
              8
            </div>
            <div
              className="number-pad-item single"
              onClick={() => {
                handleNumberClick(9);
              }}
            >
              9
            </div>
          </div>
          <div className="flex-row">
            <div
              className="number-pad-item double"
              onClick={() => {
                handleNumberClick(0);
              }}
            >
              0
            </div>
            <div className="number-pad-item single" onClick={handleCClick}>
              C
            </div>
          </div>
          <div className="flex-row">
            <div className="number-pad-item full" onClick={handleSubmitClick}>
              Submit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
