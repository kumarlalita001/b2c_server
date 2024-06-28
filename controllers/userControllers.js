const users = require("../models/userSchema");
const userotps = require("../models/userOtp");
const nodemailer = require("nodemailer");

// email config
const tarnsporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

exports.userregister = async (req, res) => {
  const { fname, email, dialCode, phone, course, HighestQualification, Yog } =
    req.body;

  if (
    !(
      fname &&
      email &&
      dialCode &&
      phone &&
      course &&
      HighestQualification &&
      Yog
    )
  ) {
    return res.status(400).json({ error: "Please Enter All Input Data" }); // Add return statement
  }

  try {
    const presuer = await users.findOne({ email: email });

    if (presuer) {
      return res
        .status(400)
        .json({ error: "U have Already Registered! Please Login..." }); // Add return statement
    } else {
      const userregister = new users({
        fname,
        email,
        dialCode,
        phone,
        course,
        HighestQualification,
        Yog,
      });

      // here password hashing

      const storeData = await userregister.save();
      return res.status(200).json(storeData); // Add return statement
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid Details", error }); // Add return statement
  }
};

// user send otp
exports.userOtpSend = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Please Enter Your Email" });
  }

  try {
    const presuer = await users.findOne({ email: email });

    if (presuer) {
      const OTP = Math.floor(100000 + Math.random() * 900000);

      const existEmail = await userotps.findOne({ email: email });

      if (existEmail) {
        const updateData = await userotps.findByIdAndUpdate(
          { _id: existEmail._id },
          {
            otp: OTP,
          },
          { new: true }
        );
        await updateData.save();

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Sending Email For Otp Validation",
          text: `OTP:- ${OTP}`,
        };

        tarnsporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "Email not send" });
          } else {
            console.log("Email sent", info.response);
            res.status(200).json({ message: "Email sent Successfully" });
          }
        });
      } else {
        const saveOtpData = new userotps({
          email,
          otp: OTP,
        });

        await saveOtpData.save();
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Sending Email For Otp Validation",
          text: `OTP:- ${OTP}`,
        };

        tarnsporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("error", error);
            res.status(400).json({ error: "Email not send" });
          } else {
            console.log("Email sent", info.response);
            res.status(200).json({ message: "Email sent Successfully" });
          }
        });
      }
    } else {
      res.status(400).json({ error: "This User Not Exist In our Db" });
    }
  } catch (error) {
    res.status(400).json({ error: "Invalid Details", error });
  }
};

exports.userLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!otp || !email) {
    return res.status(400).json({ error: "Please Enter Your OTP and email" });
  }

  try {
    const otpverification = await userotps.findOne({ email });

    if (otpverification.otp === otp) {
      const preuser = await users.findOne({ email });

      // token generate
      const token = await preuser.generateAuthtoken();
      return res
        .status(200)
        .json({ message: "User Login Succesfully Done", userToken: token });
    } else {
      return res.status(400).json({ error: "Invalid Otp" });
    }
  } catch (error) {
    return res.status(400).json({ error: "Invalid Details", error });
  }
};
