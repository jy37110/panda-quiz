import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  generateQuestions,
  getCurrentQuestion,
  questionsAreMarked,
  markQuestions,
  getGrade,
} from "../lib/lib";
import moment from "moment";
import AWS from "aws-sdk";

import { notification, message } from "antd";

import { RootState } from "../Store/store";

const { REACT_APP_LAMBDA_KEY, REACT_APP_LAMBDA_SECRET } = process.env;

AWS.config.update({
  accessKeyId: REACT_APP_LAMBDA_KEY,
  secretAccessKey: REACT_APP_LAMBDA_SECRET,
  region: "us-west-2",
});

export interface Config {
  quizAmount: number;
  isHoliday: boolean;
  scoreToPass: number;
  operators: [string];
  limitedSeconds: number;
  addSubRange: number;
  mulDivRange: number;
  holidayInfo: String;
}

export interface Question {
  left: number;
  right: number;
  operator: string;
  answer: number | null;
  isActive: boolean;
  isCorrect: boolean | null;
}

interface QuizState {
  loading: boolean;
  config: Config | null;
  errorMsg: string | null;
  questions: Question[];
  actualGrade: number | null;
  quizIsPassed: boolean | null;
  retriedTimes: number;
  startTime: string;
}

const initialState: QuizState = {
  loading: false,
  config: null,
  errorMsg: null,
  questions: [],
  actualGrade: null,
  quizIsPassed: null,
  retriedTimes: 0,
  startTime: "",
};

export const submitQuiz = createAsyncThunk<
  any,
  Question[],
  { state: RootState }
>("quiz/submitQuiz", async (questions, { getState, dispatch }) => {
  if (!questionsAreMarked(questions)) {
    const { scoreToPass, quizAmount } = getState().quiz.config;
    const { questions, retriedTimes } = getState().quiz;
    const markedQuestions = markQuestions(questions);
    dispatch(updateQuestions(markedQuestions));
    const grade = getGrade(markedQuestions);
    dispatch(setGrade(grade));
    dispatch(setQuizResult(grade >= scoreToPass));

    if (grade >= scoreToPass) {
      //pass
      console.log(getState());
      notification["success"]({
        duration: 60,
        message: "Congratulation Passed!",
        description:
          "Nice work little Panda, you have passed the quiz for today. Enjoy your day...",
      });

      const startTimeStr = getState().quiz.startTime;
      const startTime = moment(startTimeStr);
      const completeTime = moment();
      let timeSpend = completeTime.diff(startTime, "minutes");
      const endTimeOnSubmit = completeTime.format("hh:mm:ss a");

      const params = {
        FunctionName: "panda-quiz-submit-v2",
        Payload: JSON.stringify({
          startTime: startTime.format("hh:mm:ss a"),
          endTime: endTimeOnSubmit,
          totalQuiz: quizAmount.toString(),
          correct: markedQuestions
            .reduce((acc, cur) => acc + (cur.isCorrect === true ? 1 : 0), 0)
            .toString(),
          wrong: markedQuestions
            .reduce((acc, cur) => acc + (cur.isCorrect === false ? 1 : 0), 0)
            .toString(),
          retriedTimes: retriedTimes.toString(),
          timeSpend: timeSpend.toString() + " min",
          quizList: JSON.stringify(
            markedQuestions.map((item) => {
              return (
                `${item.left} ${item.operator} ${item.right} = ${item.answer} ` +
                (item.isCorrect ? "correct" : "wrong")
              );
            })
          ),
        }),
      };
      const lambda = new AWS.Lambda();

      lambda.invoke(params, (err, data) => {
        if (err) {
          console.log(err.message);
          message.error(err.message);
        } else {
          console.log(data);
          dispatch(quitQuiz());
        }
      });
    } else {
      //failed
      console.log(getState().quiz.retriedTimes);
    }
  }
});

const quizSlice = createSlice({
  name: "quiz",
  initialState: initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    startQuiz(state, action: PayloadAction<Config>) {
      try {
        state.startTime = moment().toString();
        state.config = action.payload;
        const questions = generateQuestions(action.payload);
        state.questions = questions;
        console.log(questions);
        console.log(state.config);
      } catch (e) {
        state.errorMsg = e.message;
      }
    },
    setError(state, action: PayloadAction<string>) {
      state.errorMsg = action.payload;
    },
    activateQuestion(state, action: PayloadAction<number>) {
      const index = action.payload;
      state.questions.forEach((question) => {
        question.isActive = false;
      });
      state.questions[index].isActive = true;
    },
    updateAnswer(state, action: PayloadAction<number>) {
      const currentQuestion = getCurrentQuestion(state.questions);
      if (!currentQuestion) return;

      if (currentQuestion.answer === null) {
        currentQuestion.answer = Number(action.payload);
      } else {
        currentQuestion.answer = Number(
          String(currentQuestion.answer) + String(action.payload)
        );
      }
    },
    clearAnswer(state) {
      const currentQuestion = getCurrentQuestion(state.questions);
      if (!currentQuestion) return;
      currentQuestion.answer = null;
    },
    updateQuestions(state, action: PayloadAction<Question[]>) {
      state.questions = action.payload;
    },
    setGrade(state, action: PayloadAction<number>) {
      state.actualGrade = action.payload;
    },
    setQuizResult(state, action: PayloadAction<boolean>) {
      state.quizIsPassed = action.payload;
    },
    restartQuiz(state) {
      const retriedTimes = state.retriedTimes + 1;
      const questions = generateQuestions(state.config);
      return {
        ...state,
        ...{
          questions,
          retriedTimes,
          errorMsg: null,
          actualGrade: null,
          quizIsPassed: null,
          loading: false,
        },
      };
    },
    quitQuiz() {
      return initialState;
    },
  },
});

export const selectConfig = (state: RootState) => state.quiz.config;
export const selectLoading = (state: RootState) => state.quiz.loading;
export const selectErrorMsg = (state: RootState) => state.quiz.errorMsg;
export const selectQuestions = (state: RootState) => state.quiz.questions;
export const selectGrade = (state: RootState) => state.quiz.actualGrade;
export const selectQuizIsPassed = (state: RootState) => state.quiz.quizIsPassed;

export const {
  setLoading,
  startQuiz,
  setError,
  activateQuestion,
  updateAnswer,
  clearAnswer,
  updateQuestions,
  setGrade,
  setQuizResult,
  restartQuiz,
  quitQuiz,
} = quizSlice.actions;
export default quizSlice.reducer;
