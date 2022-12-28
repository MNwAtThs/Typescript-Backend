import parsePhoneNumber from 'libphonenumber-js'
const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)

export const validate = (phonenumber: string): boolean => {
    let parsed = parsePhoneNumber(phonenumber)
    if (!parsed) {
        return false
    }
    return parsed.isValid()
}

export const format = (phonenumber: string): string => {
    let parsed = parsePhoneNumber(phonenumber)
    if (!parsed) {
        return phonenumber.removeWhiteSpaces()
    }
    return parsed.formatInternational().removeWhiteSpaces()
}

export const sendVerificationSMS = async (code: string, to: string) => {
    // only send sms in production
    if (process.env.NODE_ENV?.toLowerCase() !== 'production') {
        return
    }
    try {
        await twilioClient.messages.create({
            body: `your clone code is ${code}`,
            to,
            from: process.env.TWILIO_AUTH_NUMBER,
        })
    } catch (error) {
        console.warn(`unable to send message to: ${to}`)
        console.error(error)
    }
}

export default {
    validate,
    format,
    sendVerificationSMS,
}
