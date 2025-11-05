import nodemailer from "nodemailer"; // ❌ شلت الأقواس الغلط

export async function sendEmail({to="",subject="",text="",html="",attachments=[],cc="",bcc=""}) {
  try {
  const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass:process.env.PASSWORD ,
  },
  tls: {
    rejectUnauthorized: false, // 👈 الحل هنا
  },
});
    const info = await transporter.sendMail({
      from: '"Route Academy ✌️😊` ${process.env.EMAIL}',
      to,
      subject,
      text,
      html,
      attachments,
      cc,
      bcc
    });

    console.log("✅ Message sent successfully:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}
export const emailSubject={
    confirmEmail:"confirm your email",
    repeatPassword:"reset Your password",
    welcome:"welcome to route academy"
}
