const nodemailer = require('nodemailer');

async function sendEmail(userEmail, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD,

        }
    });


    const mailOptaions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Al-Buhaira Al-Arabia Verifivation Code",
        html: `<h1> Al-Buhaira Email Verification <h1>
               
               <p>Your verification code is:<p>
               <h2 style="color: blue;">${message}<h2>
               <img src="https://g.top4top.io/p_3564hcr1c1.png" alt="صورة جميلة">
               
               <p>Please enter this code on the verification page to mcomplete your regaistration process.<p>
               <p>If you did not request this, please ignore this email.<p>`
        
       
    };

    try{
        await transporter.sendMail(mailOptaions);
        console.log("Verification email sent");
    }catch (error){
        console.log("Email sending failed with an error:", error);
    }
}

module.exports = sendEmail;