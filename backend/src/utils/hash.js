import bcrypt from "bcrypt";

const salt_rounds = 10;  //assignment 

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, salt_rounds)
};


const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

