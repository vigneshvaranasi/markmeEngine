import express, { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { sendOTP } from '../../utils/nodemailerUtil'
import { Register } from '../../types/AuthTypes'
import ENV from '../../configs/default'
import {
  createOTP,
  getUserByEmail,
  getOTP,
  createUser,
  getUserByUsername,
  deleteOTP
} from '../../utils/dbUtils'
import { generateOTP } from '../../utils/authUtils'
import UserType from '../../types/UserTypes'

const AuthRouter = Router()

// register POST Route
AuthRouter.post('/register', async (req, res) => {
  try {
    const RegisterData: Register = req.body
    // Validating Request Body
    if (
      RegisterData.email === undefined ||
      RegisterData.password === undefined ||
      RegisterData.fullname === undefined ||
      RegisterData.gender === undefined ||
      RegisterData.profilePhoto === undefined ||
      RegisterData.username === undefined
    ) {
      res.status(400).send({
        payload: {
          message: 'Please Provide All Required Fields'
        },
        error: true
      })
      return
    }

    // Checking if User Already Exists
    const user = await getUserByEmail(RegisterData.email)
    if (user) {
      res.status(400).send({
        payload: {
          message: 'User Already Exists'
        },
        error: true
      })
      return
    }

    const hashedPassword = await bcrypt.hash(RegisterData.password, 10)
    // OTP Generation and Sending
    const otp = generateOTP()
    const NewUser: UserType = {
      username: RegisterData.username,
      email: RegisterData.email,
      password: hashedPassword,
      fullname: RegisterData.fullname,
      profilePhoto: RegisterData.profilePhoto,
      gender: RegisterData.gender
    }
    const optSent = await createOTP(NewUser, otp)
    await sendOTP(RegisterData.email, otp)
    res.status(200).send({
      payload: {
        message: 'OTP Sent Successfully'
      },
      error: false
    })
  } catch (err) {
    console.error('Registration Failed!', err)
    res.status(500).send({
      payload: {
        message: 'Registration Failed, Please Try Later'
      },
      error: true
    })
  }
})

// checkUser GET Route
AuthRouter.get('/checkUser', async (req, res) => {
  // Checking if User Already Exists
  const username = req.query.username as string
  const user = await getUserByUsername(username)
  if (user) {
    res.status(400).send({
      payload: {
        message: 'Username Already Taken'
      },
      error: true
    })
    return
  }
  res.status(200).send({
    payload: {
      message: 'Username Available'
    },
    error: false
  })
})

// verifyOtp POST Route
AuthRouter.post('/verifyOtp', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (email === undefined || otp === undefined) {
      res.status(400).send({
        payload: {
          message: 'Please Provide All Required Fields'
        },
        error: true
      })
      return
    }
    console.log('email: ', email)
    console.log('otp: ', otp)
    const user = await getOTP(email.toString(), otp.toString())
    console.log('user: ', user)
    if (!user) {
      res.send({
        payload: {
          message: 'Invalid OTP'
        },
        error: true
      })
      return
    }
    const verifiedUser: UserType = {
      username: user.username,
      email: user.email,
      password: user.password,
      fullname: user.fullname,
      profilePhoto: user.profilePhoto,
      gender: user.gender
    }
    await deleteOTP(email.toString())
    await createUser(verifiedUser)
    res.status(200).send({
      payload: {
        message: 'OTP Verified Successfully'
      },
      error: false
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      payload: {
        message: 'OTP Verification Failed'
      },
      error: true
    })
  }
})

// login POST Routea
AuthRouter.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body
    if (!id || !password) {
      res.status(400).send({
        message: 'Please Provide All Required Fields',
        error: true
      })
      return
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)
    let user: UserType
    if (isEmail) {
      user = (await getUserByEmail(id)) as typeof user
    } else {
      user = (await getUserByUsername(id)) as typeof user
    }

    if (!user) {
      res.status(401).send({
        payload: {
          message: 'Invalid Username or Password'
        },
        error: true
      })
      return
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).send({
        payload: {
          message: 'Invalid Password or Username'
        },
        error: true
      })
      return
    }

    const token = jwt.sign(
      {
        username: user.username,
        email: user.email
      },
      ENV.JWT_SECRET!,
      {
        expiresIn: '1h'
      }
    )
    res.status(200).send({
      payload: {
        message: 'Login Successful',
        token: token,
        user: {
          username: user.username,
          email: user.email,
          fullname: user.fullname,
          profilePhoto: user.profilePhoto,
          gender:user.gender
        }
      },
      error: false
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({
      payload: {
        message: 'Login Failed'
      },
      error: true
    })
  }
})

export default AuthRouter