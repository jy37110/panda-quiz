import React, { useCallback } from "react";
import "./index.scss";
import { useSelector, useDispatch } from "react-redux";
import { selectQuestions, activateQuestion } from "../../Store/quizSlice";
import { Row, Col } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { questionsAreMarked } from "../../lib/lib";
import { RootState } from "../../Store/store";

export default function TestSheet() {
  const questions = useSelector((state: RootState) => selectQuestions(state));
  const dispatch = useDispatch();

  const handleQuestionClick = useCallback(
    (index) => {
      if (!questionsAreMarked(questions)) {
        dispatch(activateQuestion(index));
      }
    },
    [dispatch, questions]
  );

  return (
    <div className="test-sheet-container">
      <div className="question-container">
        {questions.map((question, index) => {
          return (
            <Row
              className={
                question.isActive
                  ? "question-active-item question-item"
                  : "question-item"
              }
              key={index}
              onClick={() => {
                handleQuestionClick(index);
              }}
            >
              <Col offset={1} span={4} className="question-text left">
                <span>{question.left}</span>
              </Col>
              <Col span={3} className="question-text operator">
                <span>
                  {question.operator === "*"
                    ? "×"
                    : question.operator === "/"
                    ? "÷"
                    : question.operator}
                </span>
              </Col>
              <Col span={4} className="question-text right">
                <span>{question.right}</span>
              </Col>
              <Col span={3} className="question-text equal">
                <span>=</span>
              </Col>
              <Col span={7} className="question-text answer">
                <span>{question.answer}</span>
              </Col>
              {question.isCorrect !== null && (
                <Col span={2} className="question-text mark">
                  <span>
                    {question.isCorrect === true ? (
                      <CheckOutlined style={{ color: "green" }} />
                    ) : (
                      <CloseOutlined style={{ color: "red" }} />
                    )}
                  </span>
                </Col>
              )}
            </Row>
          );
        })}
      </div>
    </div>
  );
}
