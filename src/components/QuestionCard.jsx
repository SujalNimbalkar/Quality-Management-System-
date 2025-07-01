import React from 'react';

const QuestionCard = ({ question, index, onAnswer }) => {
  return (
    <div className="question-card">
      <h4>Q{index + 1}: {question.Question}</h4>
      <div>
        {["OptionA", "OptionB", "OptionC", "OptionD"].map(opt => (
          <div key={opt}>
            <label>
              <input
                type="radio"
                name={`q${index}`}
                value={question[opt]}
                onChange={() => onAnswer(question.ID, question[opt])}
              />
              {question[opt]}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
