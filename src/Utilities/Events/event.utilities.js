import { EventEmitter } from "events";
import { emailSubject, sendEmail } from "../Emails/email.utilities.js";
import { template } from "../Emails/generateOtp.js";

export const events = new EventEmitter();

// استماع للحدث "confirmEmail"
events.on("confirmEmail", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubject.confirmEmail, // ثابت بدل emailSubject
      html: template(data.otp,data.firstName,emailSubject.confirmEmail),
    });

    console.log(`📧 Confirmation email sent to ${data.to}`);
  } catch (err) {
    console.error("❌ Error sending confirmation email:", err);
  }
});
events.on("forgetPassword", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: emailSubject.resetPassword, // ثابت بدل emailSubject
      html: template(data.otp,data.firstName),
    });

    console.log(`📧 Confirmation email sent to ${data.to}`);
  } catch (err) {
    console.error("❌ Error sending confirmation email:", err);
  }
});
