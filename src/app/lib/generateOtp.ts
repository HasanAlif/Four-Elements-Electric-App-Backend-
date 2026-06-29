import otpGenerator from 'otp-generator';

const generateOtp = (): string => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  return otp;
};

export default generateOtp;
