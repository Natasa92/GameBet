export const validateGoalInput = (team, value) => {
  const result = {
    isValid: true,
    message: null,
  };

  if (isNaN(value)) {
    result.isValid = false;
    result.message = 'Incorrect value.';
  }

  if (value == null || value === '') {
    result.isValid = false;
  }
  
  return result;
};

export const validateRate = (value) => {
  return value > 0 && value <= 5;
};