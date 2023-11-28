const nodemailer = require('nodemailer');
const configs = {
    "alerta-sistemas" : {
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: "alertas-sistemas@dikter.com.ar",
            pass: "apollo@852",
        },
    },
     "macowens-ventasonline" : {
        host: "smtp.dikter.com.ar",
        port: 587,
        secure: false,
        auth: {
            user: "ventasonline@macowens.com.ar",
            pass: "$Zkx726x",
        }
    }, 
    "devre-ventasonline" : {
        host: "smtp.dikter.com.ar",
        port: 587,
        secure: false,
        auth: {
            user: "ventasonline@devre.la",
            pass: "Vta0nline1157@",
        },
    },
    "sistemas" : {
        host: "smtp.dikter.com.ar",
        port: 587,
        secure: false,
        auth: {
            user: "sistemas@macowens.com.ar",
            pass: "Jrwc47&78",
        },
    },
    "fc-electronica" : {
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
            user: "fc-electronica@dikter.com.ar",
            pass: "Fraga@1163",
        },
    }
}
//port 465 y secure: true o port 587 y secure: false

async function enviarEmail({perfil, emails, asunto, fromName, msj, isHtml}){
    if(!Object.keys(configs).includes(perfil)) throw new Error("Perfil inválido");
    const des = Array.isArray(emails) ? emails.join(",") : emails;
    const emailFrom = configs[perfil].auth.user;
    let data = {
        from: `${fromName} <${emailFrom}>`,
        to: des,
        subject: asunto
    };
    if(isHtml) data.html = msj;
    else data.text = msj;
    let transporter = nodemailer.createTransport(configs[perfil]);
    return transporter.sendMail(data);
}

module.exports = {
    enviarEmail,
    profiles: configs
};