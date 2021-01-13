import React, { useState } from 'react';
import moment from 'moment';
import './index.css'
import { Row, Col, Button, InputNumber, message } from 'antd'
import Clock from '../../Components/Clock'
import numeral from 'numeral'
import _ from 'lodash'
import AWS from 'aws-sdk'
// import Lambda from 'aws-sdk/clients/lambda'

const { LAMBDA_KEY, LAMBDA_SECRET } = process.env

AWS.config.update({accessKeyId: LAMBDA_KEY, secretAccessKey: LAMBDA_SECRET, region: 'us-west-2'})


const config = {
    DEFAULT_REMAIN: 30,
    DEFAULT_QUESTION_FIELD: 'answer',
    DEFAULT_OPERATOR: '+',
    DEFAULT_RANGE: {
        MIN: 0,
        MAX: 20,
    },
    SOUND: {
        SUCCESS: './success_sound.mp3',
        ERROR: './error_sound.mp3'
    },
};

const Home = () => {
    const [operator, setOperator] = useState(config.DEFAULT_OPERATOR);
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [questionField, setQuestionField] = useState(config.DEFAULT_QUESTION_FIELD)
    const [resultArr, setResultArr] = useState([])
    const [startTime, setStartTime] = useState(null)
    const [startTimeStr, setStartTimeStr] = useState("")
    const [endTime, setEndTime] = useState(null)
    const [endTimeStr, setEndTimeStr] = useState("")
    const [quizIsStarted, setQuizIsStarted] = useState(false)
    const [remain, setRemain] = useState(config.DEFAULT_REMAIN)

    const handleStartBtnClick = () => {
        handleResetBtnClick();
        const startTime = moment();
        setStartTime(startTime)
        setStartTimeStr(startTime.format("hh:mm:ss a"))
        setQuizIsStarted(true)
        populateNextQuestion();
    }

    const populateNextQuestion = () => {
        if (remain > 1) {
            const randomNumber = getRandomNumber();
            setLeft(questionField === 'left' ? "" : randomNumber.left);
            setRight(questionField === 'right' ? "" : randomNumber.right);
            setAnswer(questionField === 'answer' ? "" : randomNumber.answer);
        } else {
            handleQuizFinish()
        }
    }

    const getRandomNumber = () => {
        switch(operator) {
            case "+":
                return {left: getHalfRandom(), right: getHalfRandom(), answer: getRandom()}
            case "-":
                let left = getRandom();
                let right = getHalfRandom();
                if (left < right) {
                    return {left: right, right: left, answer: getHalfRandom()}
                } else {
                    return {left: left, right: right, answer: getHalfRandom()}
                }
            case "*":
                return {left: getHalfRandom(), right: getHalfRandom(), answer: getRandom()}
            case "/":
                return {left: getHalfRandom(), right: getHalfRandom(), answer: getRandom()}
            default:
                throw new Error("unknown operator")
        }
    }

    const getRandom = () => _.random(config.DEFAULT_RANGE.MIN, config.DEFAULT_RANGE.MAX)


    const getHalfRandom = () => _.random(config.DEFAULT_RANGE.MIN, config.DEFAULT_RANGE.MAX / 2)

    const handleQuizFinish = () => {
        const completeTime = moment()
        setEndTime(completeTime)
        setEndTimeStr(completeTime.format("hh:mm:ss a"))
        setQuizIsStarted(false)
        let timeDiff = completeTime.diff(startTime, 'minutes', )
        // console.log(timeDiff)
    }

    const soundPlay = (isSuccess) => {
        // const errSound = require('../../assets/error_sound.mp3')
        // const successSound = require('../../assets/success_sound.mp3')
        // const audio = new Audio(successSound)
        const audio = new Audio(isSuccess ? config.SOUND.SUCCESS : config.SOUND.ERROR).play();
    }

    const handleResetBtnClick = () => {
        setOperator(config.DEFAULT_OPERATOR);
        setLeft(0);
        setRight(0);
        setAnswer(0);
        setQuestionField(config.DEFAULT_QUESTION_FIELD);
        setResultArr([]);
        setStartTime(null);
        setStartTimeStr("")
        setEndTime(null);
        setEndTimeStr("")
        setQuizIsStarted(false);
        setRemain(config.DEFAULT_REMAIN)
    }

    const selectAllWords = (event) => {
        if (event && event.target) {
            event.target.select();
        }
    }

    const checkAnswer = () => {
        switch (operator) {
            case "+":
                return left + right === answer
            case "-":
                return left - right === answer
            case "*":
                return left * right === answer
            case "/":
                return left / right === answer
            default:
                throw new Error("unknown operator")
        }
    }

    const getCurrentQuestionField = () => {
        return questionField === "left" ? left : questionField === 'right' ? right : questionField === 'answer' ? answer : 'unknown question field'
    }

    const handleSubmitBtnClick = () => {
        let submitAnswer = getCurrentQuestionField();
        if(!_.isNumber(submitAnswer)) {
            message.error("Not a number")
            return
        }

        let result = _.cloneDeep(resultArr);
        let answerIsCorrect = checkAnswer();
        result.push({
            question: `${left} + ${right} = ${answer}`,
            correct: answerIsCorrect
        })
        setResultArr(result)
        setRemain(remain - 1)
        soundPlay(answerIsCorrect)

        populateNextQuestion();
        console.log(result)
    }

    const handleDevBtnClick = () => {
        const params = {
            FunctionName: 'panda-quiz-submit',
            Payload: JSON.stringify({ key1: 'value1', key2: 'value2'})
        }
        const lambda = new AWS.Lambda();
        lambda.invoke(params, (err, data) => {
            if (err) {
                message.error(err.message)
            } else {
                console.log(data)
            }
        })
    }

    return (
        <div className='app-container'>
            <Row className='top-bar-status-row' align="middle">
                <Col span={3}>
                    <h3>Panda Quiz</h3>
                </Col>
                <Col span={6}>
                    <h4>Start at:<span>{startTimeStr}</span></h4>
                </Col>
                <Col span={6}>
                    <h4>End at:<span>{endTimeStr}</span></h4>
                </Col>
                <Col span={6}>
                    <h4>Current time:<Clock /></h4>
                </Col>
                <Col span={3}>
                    <h4>Remain:<span>{remain}</span></h4>
                </Col>
            </Row>
            <Row className='top-bar-function-container'>
                <Col offset={18} span={3}>
                    <Button className='btn-groups' disabled={quizIsStarted} onClick={handleStartBtnClick}>Start</Button>
                </Col>
                <Col span={3}>
                    <Button className='btn-groups' disabled={!quizIsStarted} onClick={handleResetBtnClick}>Reset</Button>
                </Col>
            </Row>
            <Row className="body-container" align="middle">
                <div className="body-content-container">
                    <InputNumber value={left}
                                 disabled={!quizIsStarted}
                                 size="large"
                                 onChange={v => {if(questionField === 'left')setLeft(numeral(v).value())}}
                                 onClick={selectAllWords}
                    />
                    <span className="body-content-operator">{operator}</span>
                    <InputNumber value={right}
                                 disabled={!quizIsStarted}
                                 size="large"
                                 onClick={selectAllWords}
                                 onChange={v => {if(questionField === 'right')setRight(numeral(v).value())}}
                    />
                    <span className="body-content-operator">=</span>
                    <InputNumber value={answer}
                                 disabled={!quizIsStarted}
                                 size="large"
                                 onClick={selectAllWords}
                                 onChange={v => {if (questionField === 'answer') setAnswer(numeral(v).value())}}
                    />
                    <Button size="large" className="submit-btn" type="primary" disabled={!quizIsStarted} onClick={handleSubmitBtnClick}>Submit</Button>
                    <Button size="large" className="submit-btn" type="primary" onClick={handleDevBtnClick}>Dev</Button>

                </div>
            </Row>
            <div className="footer-container">
                <h3>
                    Result:
                    {remain === 0 &&
                    <span>
                        <span className="result-content">Total: {config.DEFAULT_REMAIN}</span>
                        <span className="result-content">Correct: {resultArr.reduce((acc, cur) => acc + (cur.correct === true ? 1 : 0), 0)}</span>
                        <span className="result-content">Wrong: {resultArr.reduce((acc, cur) => acc + (cur.correct === false ? 1 : 0), 0)}</span>
                        <span className="result-content">Time Cost: {endTime.diff(startTime, 'minutes')} minutes</span>
                    </span>}
                </h3>
                <div className='result-container'>
                    {
                        resultArr && resultArr.length > 0 &&
                        resultArr.map((item, index) => {
                            return (
                                <h3 key={index} className={item.correct ? 'correct-answer' : 'wrong-answer'}>
                                    {item.question}
                                    <span style={{marginLeft:10}}>{item.correct ? 'Great' : 'Wrong'}</span>
                                </h3>
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}

export default Home