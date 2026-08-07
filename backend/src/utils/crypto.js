import {REFRESH_TOKEN_BYTES} from "../config/env.js"
import crypto from "crypto"


export const generateSecureToken =()=>{
    return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex')
}

export const hashToken =(token)=>{
    return crypto.createHash('sha256').update(token).digest('hex')
}

//verify tokehash
export const verifyTokenHash =(token,hashToken)=>{
    const hash = crypto.createHash('sha256').update(token).digest('hex')  //get the crypto hash token
    return crypto.timingSafeEqual(Buffer.from(hash),
    Buffer.from(hashToken)
)
}

//generate cryptographically secure random string 

const generateRandomString=(length=32)=>{
    return crypto.randomBytes(length).toString('base64url')
}